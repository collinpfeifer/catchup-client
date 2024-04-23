import { View, Input, Button, Text, Form } from 'tamagui';
import { useForm, Controller } from 'react-hook-form';
import { router, useLocalSearchParams } from 'expo-router';
import { gql, useMutation } from 'urql';
import { useSession } from '@/context';

const SignUpMutation = gql`
  mutation SignUp($name: String!, $password: String!, $phoneNumber: String!) {
    signUp(name: $name, password: $password, phoneNumber: $phoneNumber) {
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
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
      }}>
      <Form
        onSubmit={handleSubmit(async (data) => {
          console.log(data);
          const result = await signUp({
            name,
            password: data.password,
            phoneNumber,
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
              placeholder='Name'
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
            />
          )}
          name='password'
        />
        <Form.Trigger asChild>
          <Button>
            <Text>Sign Up</Text>
          </Button>
        </Form.Trigger>
      </Form>
    </View>
  );
}
