import { View, Input, Button, Text, Form } from 'tamagui';
import { useForm, Controller } from 'react-hook-form';
import { router } from 'expo-router';

export default function Name() {
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
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
      }}>
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
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
            />
          )}
          name='name'
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
