import { useState } from "react";
import { useMutation } from "convex/react";
import { ConvexError } from "convex/values";
import { useRouter, Redirect } from "expo-router";
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
import { AlertCircleIcon } from "@/components/ui/icon";
import { Input, InputField } from "@/components/ui/input";
import { ScrollView } from "@/components/ui/scroll-view";
import { Textarea, TextareaInput } from "@/components/ui/textarea";
import { Text } from "@/components/ui/text";
import { Toast, ToastDescription, ToastTitle, useToast } from "@/components/ui/toast";
import { VStack } from "@/components/ui/vstack";
import { useCurrentUser } from "@/components/lib/useCurrentUser";
import { api } from "@/convex/_generated/api";
import type { UserRoles } from "@/shared/enums";

const MAX_NAME_LENGTH = 100;
const MAX_PLACE_LENGTH = 200;
const MAX_DESCRIPTION_LENGTH = 2000;

export default function CreateTourScreen() {
  const router = useRouter();
  const currentUser = useCurrentUser();
  const roles: UserRoles[] = currentUser.roles;
  const canManage = roles.includes("COMPANY") || roles.includes("ADMIN");

  const createTour = useMutation(api.tours.createTour);
  const toast = useToast();

  const [name, setName] = useState("");
  const [place, setPlace] = useState("");
  const [occupancy, setOccupancy] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!currentUser.isLoading && !canManage) {
    return <Redirect href="/home" />;
  }

  const parsedOccupancy = Number(occupancy);
  const occupancyIsValid =
    occupancy.trim().length > 0 && Number.isInteger(parsedOccupancy) && parsedOccupancy >= 1;
  const canSubmit =
    name.trim().length > 0 && place.trim().length > 0 && occupancyIsValid && !isSubmitting;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setIsSubmitting(true);
    try {
      await createTour({
        name: name.trim(),
        place: place.trim(),
        occupancy: parsedOccupancy,
        description: description.trim() || undefined,
      });
      toast.show({
        placement: "bottom",
        render: ({ id }) => (
          <Toast nativeID={`toast-${id}`} action="success">
            <ToastTitle>Tour created</ToastTitle>
          </Toast>
        ),
      });
      router.back();
    } catch (error) {
      const message = error instanceof ConvexError ? String(error.data) : "Could not create tour.";
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

  return (
    <ScrollView
      className="flex-1 bg-background-0"
      contentContainerClassName="flex-grow items-center px-6 py-8"
      keyboardShouldPersistTaps="handled"
    >
      <Box className="w-full max-w-[420px]">
        <VStack space="4xl">
          <VStack space="xs">
            <Heading className="text-3xl font-semibold text-typography-900">New tour</Heading>
            <Text className="text-sm text-typography-500">
              Tours are the routes your trips are booked against.
            </Text>
          </VStack>

          <VStack space="lg">
            <FormControl>
              <FormControlLabel>
                <FormControlLabelText>Name</FormControlLabelText>
                <FormControlLabelAstrick>*</FormControlLabelAstrick>
              </FormControlLabel>
              <Input size="lg" variant="outline">
                <InputField
                  value={name}
                  placeholder="Cenote tour"
                  onChangeText={setName}
                  maxLength={MAX_NAME_LENGTH}
                />
              </Input>
            </FormControl>

            <FormControl>
              <FormControlLabel>
                <FormControlLabelText>Place</FormControlLabelText>
                <FormControlLabelAstrick>*</FormControlLabelAstrick>
              </FormControlLabel>
              <Input size="lg" variant="outline">
                <InputField
                  value={place}
                  placeholder="Tulum"
                  onChangeText={setPlace}
                  maxLength={MAX_PLACE_LENGTH}
                />
              </Input>
            </FormControl>

            <FormControl isInvalid={occupancy.trim().length > 0 && !occupancyIsValid}>
              <FormControlLabel>
                <FormControlLabelText>Occupancy</FormControlLabelText>
                <FormControlLabelAstrick>*</FormControlLabelAstrick>
              </FormControlLabel>
              <Input size="lg" variant="outline">
                <InputField
                  value={occupancy}
                  placeholder="12"
                  onChangeText={setOccupancy}
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
                <FormControlLabelText>Description</FormControlLabelText>
              </FormControlLabel>
              <Textarea size="lg">
                <TextareaInput
                  value={description}
                  placeholder="What makes this tour special?"
                  onChangeText={setDescription}
                  maxLength={MAX_DESCRIPTION_LENGTH}
                />
              </Textarea>
            </FormControl>

            <Button size="lg" onPress={handleSubmit} isDisabled={!canSubmit}>
              {isSubmitting ? <ButtonSpinner /> : null}
              <ButtonText>Create tour</ButtonText>
            </Button>
          </VStack>
        </VStack>
      </Box>
    </ScrollView>
  );
}
