import { useState } from 'react'
import { useMutation } from 'convex/react'
import { ConvexError } from 'convex/values'
import { Box } from '@/components/ui/box'
import { Button, ButtonSpinner, ButtonText } from '@/components/ui/button'
import {
  FormControl,
  FormControlError,
  FormControlErrorIcon,
  FormControlErrorText,
  FormControlLabel,
  FormControlLabelAstrick,
  FormControlLabelText,
} from '@/components/ui/form-control'
import { Heading } from '@/components/ui/heading'
import { AlertCircleIcon, ChevronDownIcon } from '@/components/ui/icon'
import { Toast, ToastDescription, ToastTitle, useToast } from '@/components/ui/toast'
import { Input, InputField } from '@/components/ui/input'
import { ScrollView } from '@/components/ui/scroll-view'
import {
  Select,
  SelectBackdrop,
  SelectContent,
  SelectDragIndicator,
  SelectDragIndicatorWrapper,
  SelectInput,
  SelectItem,
  SelectIcon,
  SelectPortal,
  SelectTrigger,
} from '@/components/ui/select'
import { Text } from '@/components/ui/text'
import { VStack } from '@/components/ui/vstack'
import { api } from '@/convex/_generated/api'
import type { GenderType } from '@/shared/enums'

const MAX_NAME_LENGTH = 100
const MAX_PHONE_LENGTH = 50

const genderOptions = [
  { label: 'Male', value: 'MALE' },
  { label: 'Female', value: 'FEMALE' },
  { label: 'Other', value: 'OTHER' },
] as const satisfies readonly { label: string; value: GenderType }[]

export default function OnboardingWelcome() {
  const onboardUser = useMutation(api.users.onboardUser)
  const toast = useToast()
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phone, setPhone] = useState('')
  const [phoneAlt, setPhoneAlt] = useState('')
  const [age, setAge] = useState('')
  const [gender, setGender] = useState<GenderType | ''>('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const parsedAge = Number(age)
  const ageIsValid =
    age.trim().length > 0 &&
    Number.isFinite(parsedAge) &&
    parsedAge >= 1 &&
    parsedAge <= 150
  const canSubmit =
    firstName.trim().length > 0 &&
    lastName.trim().length > 0 &&
    phone.trim().length > 0 &&
    ageIsValid &&
    gender !== '' &&
    !isSubmitting

  const handleSubmit = async () => {
    const selectedGender = gender
    if (!canSubmit || selectedGender === '') return

    setIsSubmitting(true)

    try {
      await onboardUser({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim(),
        phoneAlt: phoneAlt.trim() || undefined,
        age: parsedAge,
        gender: selectedGender,
      })
      // The route gate redirects on the ONBOARDED status flip; the toast
      // is reassurance that survives the transition.
      toast.show({
        placement: 'top',
        render: ({ id }) => (
          <Toast nativeID={`toast-${id}`} action="success">
            <ToastTitle>Profile saved</ToastTitle>
          </Toast>
        ),
      })
    } catch (nextError) {
      // In prod Convex redacts plain Error messages; only ConvexError.data
      // is propagated to the client verbatim.
      const message =
        nextError instanceof ConvexError
          ? String(nextError.data)
          : 'Could not complete onboarding.'
      toast.show({
        placement: 'top',
        render: ({ id }) => (
          <Toast nativeID={`toast-${id}`} action="error">
            <ToastTitle>Couldn&apos;t save</ToastTitle>
            <ToastDescription>{message}</ToastDescription>
          </Toast>
        ),
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <ScrollView
      className="flex-1 bg-background-0"
      contentContainerClassName="flex-grow items-center justify-center px-6 py-8"
      keyboardShouldPersistTaps="handled"
    >
      <Box className="w-full max-w-[420px]">
        <VStack space="4xl">
          <VStack space="xs" className="items-center">
            <Heading className="text-center text-3xl font-semibold text-typography-900">
              Complete your profile
            </Heading>
            <Text className="text-center text-sm text-typography-500">
              Tell us a bit about you so we can set up your account.
            </Text>
          </VStack>

          <VStack space="lg">
            <FormControl>
              <FormControlLabel>
                <FormControlLabelText>First name</FormControlLabelText>
                <FormControlLabelAstrick>*</FormControlLabelAstrick>
              </FormControlLabel>
              <Input size="lg" variant="outline">
                <InputField
                  value={firstName}
                  placeholder="What should we call you?"
                  onChangeText={setFirstName}
                  maxLength={MAX_NAME_LENGTH}
                  autoCapitalize="words"
                  autoComplete="given-name"
                  textContentType="givenName"
                />
              </Input>
            </FormControl>

            <FormControl>
              <FormControlLabel>
                <FormControlLabelText>Last name</FormControlLabelText>
                <FormControlLabelAstrick>*</FormControlLabelAstrick>
              </FormControlLabel>
              <Input size="lg" variant="outline">
                <InputField
                  value={lastName}
                  placeholder="Your family name"
                  onChangeText={setLastName}
                  maxLength={MAX_NAME_LENGTH}
                  autoCapitalize="words"
                  autoComplete="family-name"
                  textContentType="familyName"
                />
              </Input>
            </FormControl>

            <FormControl>
              <FormControlLabel>
                <FormControlLabelText>Phone</FormControlLabelText>
                <FormControlLabelAstrick>*</FormControlLabelAstrick>
              </FormControlLabel>
              <Input size="lg" variant="outline">
                <InputField
                  value={phone}
                  placeholder="+1 555 555 0100"
                  onChangeText={setPhone}
                  maxLength={MAX_PHONE_LENGTH}
                  keyboardType="phone-pad"
                  autoComplete="tel"
                  textContentType="telephoneNumber"
                />
              </Input>
            </FormControl>

            <FormControl>
              <FormControlLabel>
                <FormControlLabelText>Alternate phone</FormControlLabelText>
              </FormControlLabel>
              <Input size="lg" variant="outline">
                <InputField
                  value={phoneAlt}
                  placeholder="+1 555 555 0101"
                  onChangeText={setPhoneAlt}
                  maxLength={MAX_PHONE_LENGTH}
                  keyboardType="phone-pad"
                  autoComplete="tel"
                  textContentType="telephoneNumber"
                />
              </Input>
            </FormControl>

            <FormControl isInvalid={age.trim().length > 0 && !ageIsValid}>
              <FormControlLabel>
                <FormControlLabelText>Age</FormControlLabelText>
                <FormControlLabelAstrick>*</FormControlLabelAstrick>
              </FormControlLabel>
              <Input size="lg" variant="outline">
                <InputField
                  value={age}
                  placeholder="34"
                  onChangeText={setAge}
                  keyboardType="number-pad"
                />
              </Input>
              <FormControlError>
                <FormControlErrorIcon as={AlertCircleIcon} />
                <FormControlErrorText>
                  Enter an age between 1 and 150.
                </FormControlErrorText>
              </FormControlError>
            </FormControl>

            <FormControl>
              <FormControlLabel>
                <FormControlLabelText>Gender</FormControlLabelText>
                <FormControlLabelAstrick>*</FormControlLabelAstrick>
              </FormControlLabel>
              <Select
                selectedValue={gender}
                onValueChange={(nextGender) => setGender(nextGender as GenderType)}
              >
                <SelectTrigger size="lg" variant="outline">
                  <SelectInput placeholder="Select gender" />
                  <SelectIcon as={ChevronDownIcon} className="mr-3" />
                </SelectTrigger>
                <SelectPortal>
                  <SelectBackdrop />
                  <SelectContent>
                    <SelectDragIndicatorWrapper>
                      <SelectDragIndicator />
                    </SelectDragIndicatorWrapper>
                    {genderOptions.map((option) => (
                      <SelectItem
                        key={option.value}
                        label={option.label}
                        value={option.value}
                      />
                    ))}
                  </SelectContent>
                </SelectPortal>
              </Select>
            </FormControl>

            <Button size="lg" onPress={handleSubmit} isDisabled={!canSubmit}>
              {isSubmitting ? <ButtonSpinner /> : null}
              <ButtonText>Finish onboarding</ButtonText>
            </Button>
          </VStack>
        </VStack>
      </Box>
    </ScrollView>
  )
}
