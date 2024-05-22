import * as Contacts from 'expo-contacts';
import { useState } from 'react';
import { Input, ListItem, View } from 'tamagui';
import contactSimilarity from '@/utils/contactSimilarity';
import { FlatList } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';

export default function AutocompleteInput({
  contacts,
  value,
  onChange,
  onBlur,
}: {
  contacts: Array<Contacts.Contact>;
  value: Contacts.Contact;
  onChange: (contacts: Contacts.Contact | null) => void;
  onBlur: () => void;
}) {
  const [input, setInput] = useState<string>();
  const [similarContacts, setSimilarContacts] = useState<
    Array<Contacts.Contact>
  >([]);
  return !value ? (
    <View position='absolute' minWidth='100%' marginTop='$12'>
      <Input
        value={input}
        placeholder='Search your contacts...'
        onChangeText={(text) => {
          setInput(text);
          setSimilarContacts(contactSimilarity(text, contacts));
        }}
        onBlur={onBlur}
        borderBottomLeftRadius={similarContacts.length > 0 ? 0 : 9}
        borderBottomRightRadius={similarContacts.length > 0 ? 0 : 9}
      />
      <FlatList
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        data={similarContacts}
        renderItem={({ item }) => (
          <ListItem
            title={item.name}
            subTitle={item?.phoneNumbers?.[0]?.number ?? ''}
            onPress={() => onChange(item)}
            borderBottomLeftRadius={15}
            borderBottomRightRadius={15}
          />
        )}
        keyExtractor={(item, index) => item.id ?? index.toString()}
      />
    </View>
  ) : (
    <ListItem
      title={value.name}
      borderRadius={15}
      subTitle={value?.phoneNumbers?.[0]?.number ?? ''}
      iconAfter={
        <FontAwesome name='times' size={24} onPress={() => onChange(null)} />
      }
    />
  );
}
