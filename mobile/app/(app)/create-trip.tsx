import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { ConvexError } from "convex/values";
import { Redirect, useRouter } from "expo-router";
import { Trash2 } from "lucide-react-native";
import { Box } from "@/components/ui/box";
import { Button, ButtonSpinner, ButtonText } from "@/components/ui/button";
import {
  FormControl,
  FormControlError,
  FormControlErrorIcon,
  FormControlErrorText,
  FormControlLabel,
  FormControlLabelAstrick,
  FormControlLabelText,
} from "@/components/ui/form-control";
import { Heading } from "@/components/ui/heading";
import { AlertCircleIcon, ChevronDownIcon, Icon } from "@/components/ui/icon";
import { HStack } from "@/components/ui/hstack";
import { Input, InputField } from "@/components/ui/input";
import { Pressable } from "@/components/ui/pressable";
import { ScrollView } from "@/components/ui/scroll-view";
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
} from "@/components/ui/select";
import { Text } from "@/components/ui/text";
import { Toast, ToastDescription, ToastTitle, useToast } from "@/components/ui/toast";
import { VStack } from "@/components/ui/vstack";
import { useCurrentUser } from "@/components/lib/useCurrentUser";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import type { UserRoles } from "@/shared/enums";

export default function CreateTripScreen() {
  const router = useRouter();
  const currentUser = useCurrentUser();
  const roles: UserRoles[] = currentUser.roles;
  const canManage = roles.includes("COMPANY") || roles.includes("ADMIN");

  const tours = useQuery(api.tours.listMyCompanyTours, canManage ? {} : "skip");
  const createTrip = useMutation(api.trips.createTrip);
  const toast = useToast();

  const [tourId, setTourId] = useState<Id<"tours"> | "">("");
  const [pickupLocation, setPickupLocation] = useState("");
  const [dropoffLocation, setDropoffLocation] = useState("");
  const [pickupTime, setPickupTime] = useState("");
  const [partySize, setPartySize] = useState("1");
  const [whaGroupLink, setWhaGroupLink] = useState("");
  const [emails, setEmails] = useState<string[]>([""]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!currentUser.isLoading && !canManage) {
    return <Redirect href="/home" />;
  }

  const parsedPartySize = Number(partySize);
  const partySizeIsValid =
    partySize.trim().length > 0 && Number.isInteger(parsedPartySize) && parsedPartySize >= 1;

  const pickupTimestamp = pickupTime.trim() ? new Date(pickupTime.trim()).getTime() : NaN;
  const pickupTimeIsValid = Number.isFinite(pickupTimestamp);

  const canSubmit =
    tourId !== "" &&
    pickupLocation.trim().length > 0 &&
    dropoffLocation.trim().length > 0 &&
    pickupTimeIsValid &&
    partySizeIsValid &&
    !isSubmitting;

  const updateEmail = (index: number, value: string) => {
    setEmails((current) => current.map((email, i) => (i === index ? value : email)));
  };

  const removeEmail = (index: number) => {
    setEmails((current) => current.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!canSubmit || tourId === "") return;
    setIsSubmitting(true);
    try {
      await createTrip({
        tourId,
        pickupTime: pickupTimestamp,
        partySize: parsedPartySize,
        pickupLocation: pickupLocation.trim(),
        dropoffLocation: dropoffLocation.trim(),
        participantEmails: emails.map((email) => email.trim()).filter(Boolean),
        whaGroupLink: whaGroupLink.trim() || undefined,
      });
      toast.show({
        placement: "bottom",
        render: ({ id }) => (
          <Toast nativeID={`toast-${id}`} action="success">
            <ToastTitle>Trip created</ToastTitle>
          </Toast>
        ),
      });
      router.back();
    } catch (error) {
      const message = error instanceof ConvexError ? String(error.data) : "Could not create trip.";
      toast.show({
        placement: "top",
        render: ({ id }) => (
          <Toast nativeID={`toast-${id}`} action="error">
            <ToastTitle>Couldn&apos;t save</ToastTitle>
            <ToastDescription>{message}</ToastDescription>
          </Toast>
        ),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedTourName = tours?.find((tour) => tour._id === tourId)?.name;

  return (
    <ScrollView
      className="flex-1 bg-background-0"
      contentContainerClassName="flex-grow items-center px-6 py-8"
      keyboardShouldPersistTaps="handled"
    >
      <Box className="w-full max-w-[420px]">
        <VStack space="4xl">
          <VStack space="xs">
            <Heading className="text-3xl font-semibold text-typography-900">New trip</Heading>
            <Text className="text-sm text-typography-500">
              Book a route against one of your tours.
            </Text>
          </VStack>

          <VStack space="lg">
            <FormControl>
              <FormControlLabel>
                <FormControlLabelText>Tour</FormControlLabelText>
                <FormControlLabelAstrick>*</FormControlLabelAstrick>
              </FormControlLabel>
              <Select
                selectedValue={tourId}
                onValueChange={(value) => setTourId(value as Id<"tours">)}
              >
                <SelectTrigger size="lg" variant="outline">
                  <SelectInput
                    placeholder={
                      tours === undefined
                        ? "Loading tours…"
                        : tours.length === 0
                          ? "No tours yet — create one first"
                          : "Select a tour"
                    }
                    value={selectedTourName}
                  />
                  <SelectIcon as={ChevronDownIcon} className="mr-3" />
                </SelectTrigger>
                <SelectPortal>
                  <SelectBackdrop />
                  <SelectContent>
                    <SelectDragIndicatorWrapper>
                      <SelectDragIndicator />
                    </SelectDragIndicatorWrapper>
                    {(tours ?? []).map((tour) => (
                      <SelectItem key={tour._id} label={tour.name} value={tour._id} />
                    ))}
                  </SelectContent>
                </SelectPortal>
              </Select>
            </FormControl>

            <FormControl>
              <FormControlLabel>
                <FormControlLabelText>Pickup location</FormControlLabelText>
                <FormControlLabelAstrick>*</FormControlLabelAstrick>
              </FormControlLabel>
              <Input size="lg" variant="outline">
                <InputField
                  value={pickupLocation}
                  placeholder="Cancun Airport"
                  onChangeText={setPickupLocation}
                />
              </Input>
            </FormControl>

            <FormControl>
              <FormControlLabel>
                <FormControlLabelText>Dropoff location</FormControlLabelText>
                <FormControlLabelAstrick>*</FormControlLabelAstrick>
              </FormControlLabel>
              <Input size="lg" variant="outline">
                <InputField
                  value={dropoffLocation}
                  placeholder="Tulum Centro"
                  onChangeText={setDropoffLocation}
                />
              </Input>
            </FormControl>

            <FormControl isInvalid={pickupTime.trim().length > 0 && !pickupTimeIsValid}>
              <FormControlLabel>
                <FormControlLabelText>Pickup time</FormControlLabelText>
                <FormControlLabelAstrick>*</FormControlLabelAstrick>
              </FormControlLabel>
              <Input size="lg" variant="outline">
                <InputField
                  value={pickupTime}
                  placeholder="2026-06-01 14:30"
                  onChangeText={setPickupTime}
                  autoCapitalize="none"
                />
              </Input>
              <FormControlError>
                <FormControlErrorIcon as={AlertCircleIcon} />
                <FormControlErrorText>
                  Enter a valid date and time (e.g. 2026-06-01 14:30).
                </FormControlErrorText>
              </FormControlError>
            </FormControl>

            <FormControl isInvalid={partySize.trim().length > 0 && !partySizeIsValid}>
              <FormControlLabel>
                <FormControlLabelText>Party size</FormControlLabelText>
                <FormControlLabelAstrick>*</FormControlLabelAstrick>
              </FormControlLabel>
              <Input size="lg" variant="outline">
                <InputField
                  value={partySize}
                  placeholder="2"
                  onChangeText={setPartySize}
                  keyboardType="number-pad"
                />
              </Input>
              <FormControlError>
                <FormControlErrorIcon as={AlertCircleIcon} />
                <FormControlErrorText>Enter a whole number of 1 or more.</FormControlErrorText>
              </FormControlError>
            </FormControl>

            <FormControl>
              <FormControlLabel>
                <FormControlLabelText>WhatsApp group link</FormControlLabelText>
              </FormControlLabel>
              <Input size="lg" variant="outline">
                <InputField
                  value={whaGroupLink}
                  placeholder="https://chat.whatsapp.com/…"
                  onChangeText={setWhaGroupLink}
                  autoCapitalize="none"
                  keyboardType="url"
                />
              </Input>
            </FormControl>

            <FormControl>
              <FormControlLabel>
                <FormControlLabelText>Participant emails</FormControlLabelText>
              </FormControlLabel>
              <VStack space="sm">
                {emails.map((email, index) => (
                  <HStack key={index} space="sm" className="items-center">
                    <Input size="lg" variant="outline" className="flex-1">
                      <InputField
                        value={email}
                        placeholder="traveler@example.com"
                        onChangeText={(value) => updateEmail(index, value)}
                        autoCapitalize="none"
                        keyboardType="email-address"
                      />
                    </Input>
                    {emails.length > 1 ? (
                      <Pressable onPress={() => removeEmail(index)} className="p-2">
                        <Icon as={Trash2} className="text-typography-500" />
                      </Pressable>
                    ) : null}
                  </HStack>
                ))}
                <Button
                  size="sm"
                  variant="outline"
                  onPress={() => setEmails((current) => [...current, ""])}
                >
                  <ButtonText>Add participant</ButtonText>
                </Button>
              </VStack>
            </FormControl>

            <Button size="lg" onPress={handleSubmit} isDisabled={!canSubmit}>
              {isSubmitting ? <ButtonSpinner /> : null}
              <ButtonText>Create trip</ButtonText>
            </Button>
          </VStack>
        </VStack>
      </Box>
    </ScrollView>
  );
}
