import { View, Button, Text } from 'tamagui';
import { router } from 'expo-router';
export default function Start() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
      }}>
      <Button onPress={() => router.push('/sign-in')}>
        <Text>Sign In</Text>
      </Button>
      <Button onPress={() => router.push('/name')}>
        <Text>Sign Up</Text>
      </Button>
    </View>
  );
}
