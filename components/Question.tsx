import { View, Text, Input } from 'tamagui';
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
      <View>
        <Text>{question}</Text>
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
      <View>
        <Text>{question}</Text>
        <Controller
          control={control}
          rules={{
            required: true,
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <Input onBlur={onBlur} onChangeText={onChange} value={value} />
          )}
          name={id}
        />
      </View>
    );
  }
}
