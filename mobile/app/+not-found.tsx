import React from 'react';
import { Link, Stack } from 'expo-router';
import { Text } from '@/components/Themed';
import { Center } from '@/components/ui/center';
import { Button, ButtonText } from '@/components/ui/button';


export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <Center className="flex-1">
        <Text >This screen doesn't exist.</Text>
        <Link href="/" style={{ marginTop: 10 }}>
          <Button>
            <ButtonText >Go to home screen!</ButtonText>
          </Button>

        </Link>
      </Center>
    </>
  );
}
