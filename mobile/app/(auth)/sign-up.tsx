import { Box } from '@/components/ui/box'
import { Button, ButtonText } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Center } from '@/components/ui/center'
import {
  FormControl,
  FormControlError,
  FormControlErrorText,
  FormControlHelper,
  FormControlHelperText,
  FormControlLabel,
  FormControlLabelText,
} from '@/components/ui/form-control'
import { Heading } from '@/components/ui/heading'
import { HStack } from '@/components/ui/hstack'
import { Input, InputField } from '@/components/ui/input'
import { Text } from '@/components/ui/text'
import { VStack } from '@/components/ui/vstack'
import { useSignUp } from '@clerk/expo'
import { type Href, Link as RouterLink, useRouter } from 'expo-router'
import React from 'react'

const AUTH_REDIRECT_PATH = '/app/(tabs)/tab1'
const AUTH_REDIRECT_HREF = AUTH_REDIRECT_PATH as Href

export default function Page() {
  const { signUp, errors, fetchStatus } = useSignUp()
  const router = useRouter()

  // For email OTP: collect the email address instead of the phone number
  const [emailAddress, setEmailAddress] = React.useState('')
  const [code, setCode] = React.useState('')

  const emailAddressError = errors?.fields?.emailAddress?.message
  const codeError = errors?.fields?.code?.message

  const finalizeSignUp = async () => {
    await signUp.finalize({
      navigate: ({ session, decorateUrl }) => {
        // Handle session tasks
        // See https://clerk.com/docs/guides/development/custom-flows/authentication/session-tasks
        if (session?.currentTask) {
          console.log(session?.currentTask)
          return
        }

        // If no session tasks, navigate the signed-in user to the home page
        const url = decorateUrl(AUTH_REDIRECT_PATH)
        if (typeof url === 'string' && url.startsWith('http')) {
          router.replace(AUTH_REDIRECT_HREF)
        } else {
          router.replace(url as Href)
        }
      },
    })
  }

  const handleSubmit = async () => {
    // For email OTP: change create({ phoneNumber }) to create({ emailAddress })
    const { error } = await signUp.create({ emailAddress })
    if (error) {
      console.error(JSON.stringify(error, null, 2))
      return
    }

    // For email OTP: change sendPhoneCode() to sendEmailCode()
    if (!error) await signUp.verifications.sendEmailCode()
  }

  const handleVerify = async () => {
    // For email OTP: change verifyPhoneCode() to verifyEmailCode()
    await signUp.verifications.verifyEmailCode({ code })

    if (signUp.status === 'complete') {
      await finalizeSignUp()
    } else {
      // Check why the sign-up is not complete
      console.error('Sign-up attempt not complete:', signUp)
    }
  }

  if (signUp.status === 'complete') {
    return null
  }

  if (
    signUp.status === 'missing_requirements' &&
    // For email OTP: check for email_address instead of phone_number
    signUp.unverifiedFields.includes('email_address') &&
    signUp.missingFields.length === 0
  ) {
    return (
      <Center className="flex-1 bg-background-50 px-4 py-6">
        <Card className="w-full rounded-3xl border border-outline-100 bg-background-0 px-5 py-6 shadow-sm md:w-2/3 xl:w-1/3">
          <VStack space="lg">
            <VStack space="xs">
              <Heading className="text-2xl font-bold text-typography-900">
                Verify your account
              </Heading>
              <Text className="text-sm text-typography-500">
                Enter the one-time code sent to {emailAddress || 'your inbox'}.
              </Text>
            </VStack>

            <FormControl isInvalid={Boolean(codeError)}>
              <FormControlLabel>
                <FormControlLabelText>Verification code</FormControlLabelText>
              </FormControlLabel>
              <Input size="lg" variant="outline">
                <InputField
                  value={code}
                  placeholder="Enter verification code"
                  onChangeText={(nextCode) => setCode(nextCode)}
                  keyboardType="number-pad"
                  autoComplete="one-time-code"
                  textContentType="oneTimeCode"
                />
              </Input>
              {codeError ? (
                <FormControlError>
                  <FormControlErrorText>{codeError}</FormControlErrorText>
                </FormControlError>
              ) : null}
            </FormControl>

            <VStack space="sm">
              <Button
                size="lg"
                onPress={handleVerify}
                isDisabled={fetchStatus === 'fetching' || !code}
              >
                <ButtonText>Verify</ButtonText>
              </Button>
              <Button
                size="lg"
                variant="outline"
                action="primary"
                // For email OTP: change sendPhoneCode() to sendEmailCode()
                onPress={() => signUp.verifications.sendEmailCode()}
              >
                <ButtonText>I need a new code</ButtonText>
              </Button>
            </VStack>
          </VStack>
        </Card>
      </Center>
    )
  }

  return (
    <Center className="flex-1 bg-background-50 px-4 py-6">
      <Card className="w-full rounded-3xl border border-outline-100 bg-background-0 px-5 py-6 shadow-sm md:w-2/3 xl:w-1/3">
        <VStack space="lg">
          <VStack space="xs">
            <Heading className="text-2xl font-bold text-typography-900">
              Sign up
            </Heading>
            <Text className="text-sm text-typography-500">
              Create your account with an email-based one-time code.
            </Text>
          </VStack>

          <FormControl isInvalid={Boolean(emailAddressError)}>
            <FormControlLabel>
              <FormControlLabelText>Email address</FormControlLabelText>
            </FormControlLabel>
            {/* For email OTP: collect the emailAddress instead */}
            <Input size="lg" variant="outline">
              <InputField
                value={emailAddress}
                placeholder="Enter email address"
                onChangeText={(nextEmailAddress) => setEmailAddress(nextEmailAddress)}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="email"
                textContentType="emailAddress"
              />
            </Input>
            {emailAddressError ? (
              <FormControlError>
                <FormControlErrorText>{emailAddressError}</FormControlErrorText>
              </FormControlError>
            ) : (
              <FormControlHelper>
                <FormControlHelperText>
                  We&apos;ll email you a code to finish setup.
                </FormControlHelperText>
              </FormControlHelper>
            )}
          </FormControl>

          <Button
            size="lg"
            onPress={handleSubmit}
            isDisabled={!emailAddress || fetchStatus === 'fetching'}
          >
            <ButtonText>Continue</ButtonText>
          </Button>

          {/* For your debugging purposes. You can just console.log errors, but we put them in the UI for convenience */}
          {/*{errors ? (
            <Box className="rounded-2xl bg-background-50 px-3 py-2">
              <Text className="text-xs text-typography-500">
                {JSON.stringify(errors, null, 2)}
              </Text>
            </Box>
          ) : null}*/}

          <HStack className="items-center justify-center">
            <Text className="text-sm text-typography-600">
              Already have an account?
            </Text>
            <RouterLink href="/(auth)/sign-in" asChild>
              <Button variant="link" action="primary" className="h-auto px-2">
                <ButtonText>Sign in</ButtonText>
              </Button>
            </RouterLink>
          </HStack>
        </VStack>
      </Card>
    </Center>
  )
}
