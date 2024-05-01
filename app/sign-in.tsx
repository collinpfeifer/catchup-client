import { View, Input, Button, Text, Form } from 'tamagui';
import { useForm, Controller } from 'react-hook-form';
import { formatIncompletePhoneNumber } from 'libphonenumber-js';
import { gql, useMutation } from 'urql';
import { useSession } from '@/context';
import { router } from 'expo-router';
import formatPhoneNumber from '@/utils/formatPhoneNumber';
import { FontAwesome } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';

const SignInMutation = gql`
  mutation SignIn(
    $password: String!
    $phoneNumber: String!
    $pushToken: String!
  ) {
    login(
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

export default function SignIn() {
  const { signIn } = useSession();
  const [, login] = useMutation(SignInMutation);
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      phoneNumber: '',
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
        marginTop='$13'
        zIndex={1}
        borderColor='black'
        borderRadius={50}>
        <FontAwesome name='chevron-left' size={26} />
      </Button>
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#e8ebe8',
        }}>
        <Text fontWeight='900' fontSize='$9' marginTop='$-14' marginBottom='$2'>
          Sign Back In
        </Text>
        <Text marginBottom='$18'>
          Nice to see you again! Please sign in to continue.
        </Text>
        <Form
          onSubmit={handleSubmit(async (data) => {
            console.log(data);
            const result = await login({
              phoneNumber: formatPhoneNumber(data.phoneNumber),
              password: data.password,
              // pushToken: (
              //   await Notifications.getExpoPushTokenAsync({
              //     projectId: Constants.expoConfig?.extra?.eas?.projectId,
              //   })
              // ).data,
              pushToken: 'fake-push-token',
            });
            console.log(result.data.login);
            signIn({
              userId: result.data.login.user.id,
              accessToken: result.data.login.token,
              refreshToken: result.data.login.refreshToken,
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
                marginBottom='$4'
                borderRadius={25}
                size='$5'
                minWidth='65%'
                borderColor='black'
                placeholder='Phone Number'
                onBlur={onBlur}
                onChangeText={(text) =>
                  onChange(formatIncompletePhoneNumber(text, 'US'))
                }
                value={value}
              />
            )}
            name='phoneNumber'
          />
          <Controller
            control={control}
            rules={{
              required: true,
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                placeholder='Password'
                marginBottom='$4'
                borderRadius={25}
                size='$5'
                minWidth='65%'
                borderColor='black'
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
                Continue
              </Text>
            </Button>
          </Form.Trigger>
        </Form>
      </View>
    </>
  );
}
