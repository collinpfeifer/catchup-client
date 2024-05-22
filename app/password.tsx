import { View, Input, Button, Text, Form, useMedia } from 'tamagui';
import { useForm, Controller } from 'react-hook-form';
import { router, useLocalSearchParams } from 'expo-router';
import { gql, useMutation } from 'urql';
import { useSession } from '@/context';
import * as Notifications from 'expo-notifications';
import { FontAwesome } from '@expo/vector-icons';
import Constants from 'expo-constants';
import DismissKeyboard from '@/components/DismissKeyboard';

const SignUpMutation = gql`
  mutation SignUp(
    $name: String!
    $password: String!
    $phoneNumber: String!
    $pushToken: String!
  ) {
    signUp(
      name: $name
      password: $password
      phoneNumber: $phoneNumber
      pushToken: $pushToken
    ) {
      refreshToken
      token
      user {
        id
      }
    }
  }
`;

export default function Password() {
  const { phoneNumber, name } = useLocalSearchParams();
  const { signIn } = useSession();
  const [, signUp] = useMutation(SignUpMutation);
  const media = useMedia();
  console.log(media);
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      password: '',
    },
  });
  return (
    <>
      <Button
        onPress={() => router.back()}
        position='absolute'
        marginLeft='$6'
        size='$5'
        // marginTop='$13'
        marginTop={media.short ? '15%' : '$13'}
        borderColor='black'
        zIndex={1}
        borderRadius={50}>
        <FontAwesome name='chevron-left' size={26} />
      </Button>
      <DismissKeyboard>
        <View
          flex={1}
          justifyContent='center'
          alignItems='center'
          backgroundColor='#e8ebe8'>
          <Text
            fontWeight='900'
            fontSize='$9'
            // marginTop='$-18'
            marginTop='$2'>
            What's your password?
          </Text>
          <Text marginBottom='$19' marginTop='$4'>
            Don't worry, we won't tell ;)
          </Text>
          <Form
            onSubmit={handleSubmit(async (data) => {
              console.log(data);
              const result = await signUp({
                name,
                password: data.password,
                phoneNumber,
                pushToken: (
                  await Notifications.getExpoPushTokenAsync({
                    projectId: Constants.expoConfig?.extra?.eas?.projectId,
                  })
                ).data,
              });
              console.log(result);
              signIn({
                userId: result.data.signUp.user.id,
                accessToken: result.data.signUp.token,
                refreshToken: result.data.signUp.refreshToken,
              });
              router.push({ pathname: '/(tabs)' });
            })}>
            <Controller
              control={control}
              rules={{
                required: true,
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  placeholder='$3cr3tP@$$w0rd'
                  borderColor='black'
                  borderRadius={25}
                  size='$5'
                  minWidth='65%'
                  marginBottom='$4'
                  secureTextEntry
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                />
              )}
              name='password'
            />
            <Form.Trigger asChild>
              <Button backgroundColor='black'>
                <Text color='white' fontSize='$6'>
                  Sign Up
                </Text>
              </Button>
            </Form.Trigger>
          </Form>
        </View>
      </DismissKeyboard>
    </>
  );
}
