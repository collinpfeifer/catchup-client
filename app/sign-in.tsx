import { View, Input, Button, Text } from 'tamagui';
import { useForm, Controller } from 'react-hook-form';
import { formatIncompletePhoneNumber } from 'libphonenumber-js';

export default function SignIn() {
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
      <Button onPress={handleSubmit(() => console.log('coo'))}>
        <Text>Submit</Text>
      </Button>
    </View>
  );
}
