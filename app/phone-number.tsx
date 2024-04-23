import { View, Input, Button, Text, Form } from 'tamagui';
import { useForm, Controller } from 'react-hook-form';
import { router, useLocalSearchParams } from 'expo-router';
import { gql, useMutation } from 'urql';
import formatPhoneNumber from '@/utils/formatPhoneNumber';

const SendSMSVerificationMutation = gql`
  mutation SendSMSVerification($phoneNumber: String!) {
    sendSMSVerificationCode(phoneNumber: $phoneNumber)
  }
`;

export default function PhoneNumber() {
  const [, sendSMSVerification] = useMutation(SendSMSVerificationMutation);
  const { name } = useLocalSearchParams();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      phoneNumber: '',
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
          const formattedPhoneNumber = formatPhoneNumber(data.phoneNumber);
          console.log(data, formattedPhoneNumber);
          const result = await sendSMSVerification({
            phoneNumber: formattedPhoneNumber,
          });
          console.log(result);
          router.push({
            pathname: '/otp',
            params: { phoneNumber: formattedPhoneNumber, name },
          });
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
              onChangeText={onChange}
              value={value}
            />
          )}
          name='phoneNumber'
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
