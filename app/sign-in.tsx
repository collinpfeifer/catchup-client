import { View, Input, Button, Text, Form } from 'tamagui';
import { useForm, Controller } from 'react-hook-form';
import { formatIncompletePhoneNumber } from 'libphonenumber-js';
import { gql, useMutation } from 'urql';
import { useSession } from '@/context';
import { router } from 'expo-router';
import formatPhoneNumber from '@/utils/formatPhoneNumber';

const SignInMutation = gql`
  mutation SignIn($password: String!, $phoneNumber: String!) {
    login(password: $password, phoneNumber: $phoneNumber) {
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
          });
          console.log(result);
          signIn(
            result.data.login.user.id,
            result.data.login.token,
            result.data.login.refreshToken
          );
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
          <Button onPress={handleSubmit(() => console.log('coo'))}>
            <Text>Submit</Text>
          </Button>
        </Form.Trigger>
      </Form>
    </View>
  );
}
