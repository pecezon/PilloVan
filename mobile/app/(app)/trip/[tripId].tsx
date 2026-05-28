import { useEffect, useRef, useState } from 'react'
import { FlatList } from '@/components/ui/flat-list'
import { KeyboardAvoidingView } from '@/components/ui/keyboard-avoiding-view'
import { Platform } from 'react-native'
import { useMutation, usePaginatedQuery, useQuery } from 'convex/react'
import { ConvexError } from 'convex/values'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { ChevronLeft, Send } from 'lucide-react-native'
import { Avatar, AvatarFallbackText } from '@/components/ui/avatar'
import { Badge, BadgeText } from '@/components/ui/badge'
import { Box } from '@/components/ui/box'
import { Button, ButtonIcon, ButtonText } from '@/components/ui/button'
import { HStack } from '@/components/ui/hstack'
import { Heading } from '@/components/ui/heading'
import { Icon } from '@/components/ui/icon'
import { Input, InputField } from '@/components/ui/input'
import { Pressable } from '@/components/ui/pressable'
import { Spinner } from '@/components/ui/spinner'
import { Text } from '@/components/ui/text'
import { Toast, ToastDescription, ToastTitle, useToast } from '@/components/ui/toast'
import { VStack } from '@/components/ui/vstack'
import { useCurrentUser } from '@/components/lib/useCurrentUser'
import { api } from '@/convex/_generated/api'
import type { Doc, Id } from '@/convex/_generated/dataModel'
import type { ChatKind } from '@/shared/enums'

type ChatDoc = Doc<'chats'>

const kindLabel: Record<ChatKind, string> = {
  GENERAL: 'General',
  WORKERS: 'Workers',
}

function senderName(sender: { firstName?: string; lastName?: string } | null) {
  if (!sender) return 'Unknown'
  const name = [sender.firstName, sender.lastName].filter(Boolean).join(' ')
  return name || 'Unknown'
}

function formatTime(ts: number) {
  return new Date(ts).toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  })
}

export default function TripRoomScreen() {
  const router = useRouter()
  const { tripId } = useLocalSearchParams<{ tripId: string }>()
  const tripIdTyped = tripId as Id<'trips'>

  const currentUser = useCurrentUser()
  const myId = currentUser.state === 'onboarded' ? currentUser.user._id : undefined

  const ensureTripChats = useMutation(api.chats.ensureTripChats)
  const ensuredRef = useRef(false)
  const [ensured, setEnsured] = useState(false)

  useEffect(() => {
    if (ensuredRef.current) return
    ensuredRef.current = true
    void ensureTripChats({ tripId: tripIdTyped }).then(() => setEnsured(true))
  }, [ensureTripChats, tripIdTyped])

  return (
    <Box className="flex-1 bg-background-0 py-safe">
      <HStack className="items-center gap-2 px-4 py-3">
        <Pressable onPress={() => router.back()} className="p-1">
          <Icon as={ChevronLeft} size="xl" className="text-typography-700" />
        </Pressable>
        <Heading size="lg" className="text-typography-900">
          Trip chat
        </Heading>
      </HStack>
      {ensured ? (
        <ChatArea tripId={tripIdTyped} myId={myId} />
      ) : (
        <Box className="flex-1 items-center justify-center">
          <Spinner />
        </Box>
      )}
    </Box>
  )
}

function ChatArea({
  tripId,
  myId,
}: {
  tripId: Id<'trips'>
  myId: Id<'users'> | undefined
}) {
  const chatData = useQuery(api.chats.listMyTripChats, { tripId })
  const [selectedKind, setSelectedKind] = useState<ChatKind>('GENERAL')

  if (chatData === undefined) {
    return (
      <Box className="flex-1 items-center justify-center">
        <Spinner />
      </Box>
    )
  }

  const chats = chatData.chats
  const activeChat =
    chats.find((chat) => chat.kind === selectedKind) ?? chats[0]

  return (
    <VStack className="flex-1">
      {chats.length > 1 && (
        <HStack className="gap-2 px-4 pb-2">
          {chats.map((chat) => {
            const isActive = chat._id === activeChat?._id
            return (
              <Button
                key={chat._id}
                size="sm"
                variant={isActive ? 'solid' : 'outline'}
                onPress={() => setSelectedKind(chat.kind)}
              >
                <ButtonText>{kindLabel[chat.kind]}</ButtonText>
              </Button>
            )
          })}
        </HStack>
      )}

      {activeChat ? (
        <MessageList chat={activeChat} myId={myId} />
      ) : (
        <Box className="flex-1 items-center justify-center px-6">
          <Text className="text-center text-typography-500">
            No chat available for this trip.
          </Text>
        </Box>
      )}
    </VStack>
  )
}

function MessageList({
  chat,
  myId,
}: {
  chat: ChatDoc
  myId: Id<'users'> | undefined
}) {
  const toast = useToast()
  const sendMessage = useMutation(api.chats.sendMessage)
  const [draft, setDraft] = useState('')
  const [isSending, setIsSending] = useState(false)

  const { results, status, loadMore } = usePaginatedQuery(
    api.chats.listMessages,
    { chatId: chat._id },
    { initialNumItems: 30 }
  )

  const handleSend = async () => {
    const body = draft.trim()
    if (!body || isSending) return
    setIsSending(true)
    try {
      await sendMessage({ chatId: chat._id, body })
      setDraft('')
    } catch (error) {
      const message =
        error instanceof ConvexError ? String(error.data) : 'Could not send message.'
      toast.show({
        placement: 'top',
        render: ({ id }) => (
          <Toast nativeID={`toast-${id}`} action="error">
            <ToastTitle>Couldn&apos;t send</ToastTitle>
            <ToastDescription>{message}</ToastDescription>
          </Toast>
        ),
      })
    } finally {
      setIsSending(false)
    }
  }

  return (
    <KeyboardAvoidingView
      className="flex-1"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {results.length === 0 && status !== 'LoadingFirstPage' ? (
        <Box className="flex-1 items-center justify-center px-6">
          <Text className="text-center text-typography-500">
            No messages yet. Say hello!
          </Text>
        </Box>
      ) : (
        <FlatList
          data={results}
          inverted
          keyExtractor={(item) => item._id}
          contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 12 }}
          onEndReached={() => {
            if (status === 'CanLoadMore') loadMore(30)
          }}
          onEndReachedThreshold={0.4}
          renderItem={({ item }) => (
            <MessageBubble message={item} isMine={item.senderId === myId} />
          )}
        />
      )}

      <HStack className="items-center gap-2 border-t border-outline-100 px-4 py-3">
        <Input size="lg" variant="outline" className="flex-1">
          <InputField
            value={draft}
            placeholder="Message"
            onChangeText={setDraft}
            onSubmitEditing={() => void handleSend()}
            returnKeyType="send"
            multiline
          />
        </Input>
        <Button
          size="lg"
          onPress={() => void handleSend()}
          isDisabled={draft.trim().length === 0 || isSending}
        >
          <ButtonIcon as={Send} />
        </Button>
      </HStack>
    </KeyboardAvoidingView>
  )
}

type MessageItem = {
  _id: Id<'messages'>
  _creationTime: number
  body: string
  senderId: Id<'users'>
  sender: { firstName?: string; lastName?: string; role: string | null } | null
}

function MessageBubble({
  message,
  isMine,
}: {
  message: MessageItem
  isMine: boolean
}) {
  const isHost = message.sender?.role === 'COMPANY' || message.sender?.role === 'ADMIN'
  const name = senderName(message.sender)

  return (
    <Box className={`mb-2 max-w-[80%] ${isMine ? 'self-end' : 'self-start'}`}>
      {!isMine && (
        <HStack className="mb-1 items-center gap-2">
          <Avatar size="xs">
            <AvatarFallbackText>{name}</AvatarFallbackText>
          </Avatar>
          <Text className="text-xs font-medium text-typography-600">{name}</Text>
          {isHost && (
            <Badge action="info" size="sm" variant="solid">
              <BadgeText>Host</BadgeText>
            </Badge>
          )}
        </HStack>
      )}
      <Box
        className={`rounded-2xl px-4 py-2 ${
          isMine ? 'bg-primary-500' : 'bg-background-100'
        }`}
      >
        <Text className={isMine ? 'text-typography-0' : 'text-typography-900'}>
          {message.body}
        </Text>
      </Box>
      <Text
        className={`mt-1 text-[10px] text-typography-400 ${
          isMine ? 'text-right' : 'text-left'
        }`}
      >
        {formatTime(message._creationTime)}
      </Text>
    </Box>
  )
}
