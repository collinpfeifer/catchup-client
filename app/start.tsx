import { View, Button, Text, Image } from 'tamagui';
import { router } from 'expo-router';
import Logo from '@/assets/images/catch_up_logo-removebg-preview.png';
export default function Start() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#e8ebe8',
      }}>
      <Image width='100%' height='50%' source={Logo} />
      <Button
        onPress={() => router.push('/sign-in')}
        width='50%'
        backgroundColor='black'
        // backgroundColor='#fb2421'
        my='$4'>
        <Text color='white' fontSize='$6'>
          Sign In
        </Text>
      </Button>
      <Button
        onPress={() => router.push('/name')}
        width='50%'
        // backgroundColor='#fd9a17'
        backgroundColor='black'
        my='$4'>
        <Text color='white' fontSize='$6'>
          Sign Up
        </Text>
      </Button>
    </View>
  );
}
