import { View, Input, Button, Text, Form } from 'tamagui';
import { useForm, Controller } from 'react-hook-form';
import { router, useLocalSearchParams } from 'expo-router';
import { gql, useMutation } from 'urql';

const VerifySMSCodeMutation = gql`
  mutation VerifySMSCode($code: String!, $phoneNumber: String!) {
    verifySMSCode(code: $code, phoneNumber: $phoneNumber)
  }
`;

export default function Otp() {
  const [, verifySMSCode] = useMutation(VerifySMSCodeMutation);
  const { phoneNumber, name } = useLocalSearchParams();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      code: '',
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
          const result = await verifySMSCode({
            code: data.code,
            phoneNumber,
          });
          console.log(result);
          if (result.data.verifySMSCode) {
            router.push({
              pathname: '/password',
              params: { phoneNumber, name },
            });
          }
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
          name='code'
        />
        <Form.Trigger asChild>
          <Button>
            <Text>Continue</Text>
          </Button>
        </Form.Trigger>
      </Form>
    </View>
  );
}
