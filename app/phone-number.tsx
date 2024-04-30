import { View, Input, Button, Text, Form } from 'tamagui';
import { useForm, Controller } from 'react-hook-form';
import { router, useLocalSearchParams } from 'expo-router';
import { gql, useMutation } from 'urql';
import formatPhoneNumber from '@/utils/formatPhoneNumber';
import { FontAwesome } from '@expo/vector-icons';
import { formatIncompletePhoneNumber } from 'libphonenumber-js';

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
    <>
      <Button
        onPress={() => router.back()}
        position='absolute'
        marginLeft='$6'
        size='$5'
        marginTop='$13'
        borderColor='black'
        zIndex={1}
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
        <Text fontWeight='900' fontSize='$9' marginTop='$-20'>
          What's your Number?
        </Text>
        <Text marginBottom='$19'>
          We're not a frat guy at the bar, promise!
        </Text>
        <Form
          onSubmit={handleSubmit(async (data) => {
            const formattedPhoneNumber = formatPhoneNumber(data.phoneNumber);
            console.log(data, formattedPhoneNumber);
            const result = await sendSMSVerification({
              phoneNumber: formattedPhoneNumber,
            });
            console.log(result);
            // if (result.data.sendSMSVerificationCode)
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
                borderColor='black'
                borderRadius={25}
                size='$5'
                minWidth='65%'
                marginBottom='$4'
                onBlur={onBlur}
                onChangeText={(text) =>
                  onChange(formatIncompletePhoneNumber(text, 'US'))
                }
                value={value}
              />
            )}
            name='phoneNumber'
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
