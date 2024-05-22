import { View, Input, Button, Text, Form, useMedia } from 'tamagui';
import { useForm, Controller } from 'react-hook-form';
import { router, useLocalSearchParams } from 'expo-router';
import { gql, useMutation } from 'urql';
import { FontAwesome } from '@expo/vector-icons';
import DismissKeyboard from '@/components/DismissKeyboard';

const VerifySMSCodeMutation = gql`
  mutation VerifySMSCode($code: String!, $phoneNumber: String!) {
    verifySMSCode(code: $code, phoneNumber: $phoneNumber)
  }
`;

export default function Otp() {
  const [, verifySMSCode] = useMutation(VerifySMSCodeMutation);
  const { phoneNumber, name } = useLocalSearchParams();
  const media = useMedia();
  console.log(media);
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
            Check your texts!
          </Text>
          <Text marginBottom='$19' marginTop='$4'>
            You should see a text with a code waiting.
          </Text>
          <Form
            onSubmit={handleSubmit(async (data) => {
              console.log(data);
              const result = await verifySMSCode({
                code: data.code,
                phoneNumber,
              });
              console.log(result);
              if (result.data.verifySMSCode)
                router.push({
                  pathname: '/password',
                  params: { phoneNumber, name },
                });
            })}>
            <Controller
              control={control}
              rules={{
                required: true,
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  placeholder='123...'
                  borderColor='black'
                  borderRadius={25}
                  size='$5'
                  minWidth='65%'
                  marginBottom='$4'
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                />
              )}
              name='code'
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
      </DismissKeyboard>
    </>
  );
}
