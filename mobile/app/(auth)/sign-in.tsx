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
import { useSignIn } from '@clerk/expo'
import { type Href, Link as RouterLink, useRouter } from 'expo-router'
import React from 'react'

const AUTH_REDIRECT_PATH = '/app/(tabs)/tab1'
const AUTH_REDIRECT_HREF = AUTH_REDIRECT_PATH as Href

export default function Page() {
  const { signIn, errors, fetchStatus } = useSignIn()
  const router = useRouter()

  // For email OTP: collect the email address instead of the phone number
  const [emailAddress, setEmailAddress] = React.useState('')
  const [code, setCode] = React.useState('')

  const identifierError = errors?.fields?.identifier?.message
  const codeError = errors?.fields?.code?.message

  const finalizeSignIn = async () => {
    await signIn.finalize({
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
    // For email OTP: change phoneNumber to emailAddress
    const { error } = await signIn.create({ identifier: emailAddress })
    if (error) {
      // See https://clerk.com/docs/guides/development/custom-flows/error-handling
      console.error(JSON.stringify(error, null, 2))
      return
    }

    // For email OTP: change phoneCode.sendCode() to emailCode.sendCode()
    if (!error) await signIn.emailCode.sendCode({ emailAddress })

    if (signIn.status === 'complete') {
      await finalizeSignIn()
    } else if (signIn.status === 'needs_second_factor') {
      // See https://clerk.com/docs/guides/development/custom-flows/authentication/multi-factor-authentication
    } else if (signIn.status === 'needs_client_trust') {
      // See https://clerk.com/docs/guides/development/custom-flows/authentication/client-trust
    } else {
      // Check why the sign-in is not complete
      console.error('Sign-in attempt not complete:', signIn)
    }
  }

  const handleVerification = async () => {
    // For email OTP: change phoneCode.verifyCode() to emailCode.verifyCode()
    await signIn.emailCode.verifyCode({ code })

    if (signIn.status === 'complete') {
      await finalizeSignIn()
    } else {
      // Check why the sign-in is not complete
      console.error('Sign-in attempt not complete:', signIn)
    }
  }

  if (signIn.status === 'needs_first_factor') {
    return (
      <Center className="flex-1 bg-background-50 px-4 py-6">
        <Card className="w-full rounded-3xl border border-outline-100 bg-background-0 px-5 py-6 shadow-sm md:w-2/3 xl:w-1/3">
          <VStack space="lg">
            <VStack space="xs">
              <Heading className="text-2xl font-bold text-typography-900">
                Verify your email address
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
                  placeholder="Enter your verification code"
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
                onPress={handleVerification}
                isDisabled={fetchStatus === 'fetching' || !code}
              >
                <ButtonText>Verify</ButtonText>
              </Button>
              <Button
                size="lg"
                variant="outline"
                action="primary"
                // For email OTP: change phoneCode.sendCode() to emailCode.sendCode()
                onPress={() => signIn.emailCode.sendCode({ emailAddress })}
              >
                <ButtonText>I need a new code</ButtonText>
              </Button>
              <Button
                variant="link"
                action="primary"
                className="h-auto self-center px-0"
                onPress={() => {
                  setCode('')
                  signIn.reset()
                }}
              >
                <ButtonText>Start over</ButtonText>
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
              Sign in
            </Heading>
            <Text className="text-sm text-typography-500">
              Use your email address to receive a one-time sign-in code.
            </Text>
          </VStack>

          <FormControl isInvalid={Boolean(identifierError)}>
            <FormControlLabel>
              <FormControlLabelText>Email address</FormControlLabelText>
            </FormControlLabel>
            {/* For email OTP: collect the email address instead of the phone number */}
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
            {identifierError ? (
              <FormControlError>
                <FormControlErrorText>{identifierError}</FormControlErrorText>
              </FormControlError>
            ) : (
              <FormControlHelper>
                <FormControlHelperText>
                  We&apos;ll send a one-time code to this address.
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
              Don&apos;t have an account?
            </Text>
            <RouterLink href="/(auth)/sign-up" asChild>
              <Button variant="link" action="primary" className="h-auto px-2">
                <ButtonText>Sign up</ButtonText>
              </Button>
            </RouterLink>
          </HStack>
        </VStack>
      </Card>
    </Center>
  )
}
