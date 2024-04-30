import { View, Text, Input, TextArea } from 'tamagui';
import { Control, Controller } from 'react-hook-form';
import AutocompleteInput from './AutocompleteInput';
import * as Contacts from 'expo-contacts';

export default function Question({
  id,
  control,
  type,
  contacts,
  question,
}: {
  id: string;
  control: Control;
  type: string;
  contacts: Array<Contacts.Contact>;
  question: string;
}) {
  if (type === 'USER') {
    return (
      <View maxWidth={360}>
        <Text
          color='white'
          fontWeight='bold'
          textAlign='center'
          fontSize='$8'
          my='$4'
          marginBottom='$8'>
          {question}
        </Text>
        <Controller
          control={control}
          rules={{
            required: true,
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <AutocompleteInput
              onBlur={onBlur}
              contacts={contacts}
              onChange={onChange}
              value={value}
            />
          )}
          name={id}
        />
      </View>
    );
  } else if (type === 'TEXT') {
    return (
      <View zIndex={-1} maxWidth={360}>
        <Text
          color='white'
          fontWeight='bold'
          textAlign='center'
          fontSize='$8'
          my='$4'>
          {question}
        </Text>
        <Controller
          control={control}
          rules={{
            required: true,
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextArea
              onBlur={onBlur}
              onChangeText={onChange}
              size='$4'
              borderWidth={2}
              value={value}
              placeholder='Why did you choose them?'
            />
          )}
          name={id}
        />
      </View>
    );
  }
}
