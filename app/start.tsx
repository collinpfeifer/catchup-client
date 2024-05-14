import { View, Button, Text, Image, XStack } from 'tamagui';
import { router } from 'expo-router';
import Logo from '@/assets/images/catch_up_logo-removebg-preview.png';

export default function Start() {
  console.log('Start');
  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#e8ebe8',
      }}>
      <Image source={Logo} />
      <Text
        fontSize='$8'
        fontFamily='Rubix'
        textAlign='center'
        marginBottom='$4'>
        See what your friends truly think about you!
      </Text>
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
