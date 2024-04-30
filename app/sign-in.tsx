import { View, Input, Button, Text, Form } from 'tamagui';
import { useForm, Controller } from 'react-hook-form';
import { formatIncompletePhoneNumber } from 'libphonenumber-js';
import { gql, useMutation } from 'urql';
import { useSession } from '@/context';
import { router } from 'expo-router';
import formatPhoneNumber from '@/utils/formatPhoneNumber';
import * as Notifications from 'expo-notifications';

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
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
      }}>
      <Form
        onSubmit={handleSubmit(async (data) => {
          console.log(data);
          const result = await login({
            phoneNumber: formatPhoneNumber(data.phoneNumber),
            password: data.password,
            pushToken: (await Notifications.getExpoPushTokenAsync()).data,
          });
          console.log(result);
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
              secureTextEntry
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
            />
          )}
          name='password'
        />
        <Form.Trigger asChild>
          <Button>
            Submit
          </Button>
        </Form.Trigger>
      </Form>
    </View>
  );
}
