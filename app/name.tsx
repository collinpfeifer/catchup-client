import { View, Input, Button, Text, Form, useMedia } from 'tamagui';
import { useForm, Controller } from 'react-hook-form';
import { router } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import DismissKeyboard from '@/components/DismissKeyboard';

export default function Name() {
  const media = useMedia();
  console.log(media);
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: '',
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
            What's your name?
          </Text>
          <Text marginBottom='$19' marginTop='$4'>
            Use your real name so your friends can find you.
          </Text>
          <Form
            onSubmit={handleSubmit((data) => {
              console.log(data);
              router.push({ pathname: '/phone-number', params: data });
            })}>
            <Controller
              control={control}
              rules={{
                required: true,
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  placeholder='Name'
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
              name='name'
            />
            <Form.Trigger asChild>
              <Button backgroundColor='black'>
                <Text color='white' fontSize='$6'>
                  Next
                </Text>
              </Button>
            </Form.Trigger>
          </Form>
        </View>
      </DismissKeyboard>
    </>
  );
}
