import * as Contacts from 'expo-contacts';
import { useState } from 'react';
import { Input, ListItem } from 'tamagui';
import contactSimilarity from '@/utils/contactSimilarity';
import { FlatList } from 'react-native';

export default function AutocompleteInput({
  contacts,
  value,
  onChange,
  onBlur,
}: {
  contacts: Array<Contacts.Contact>;
  value: Contacts.Contact;
  onChange: (contacts: Contacts.Contact) => void;
  onBlur: () => void;
}) {
  const [input, setInput] = useState<string>();
  const [similarContacts, setSimilarContacts] =
    useState<Array<Contacts.Contact>>();
  return (
    <>
      <Input
        value={input}
        placeholder='Search your contacts'
        onChangeText={(text) => {
          setInput(text);
          setSimilarContacts(contactSimilarity(text, contacts));
        }}
        onBlur={onBlur}
      />
      <FlatList
        data={similarContacts}
        renderItem={({ item }) => (
          <ListItem
            title={item.name}
            subTitle={item?.phoneNumbers?.[0]?.number ?? ''}
            onPress={() => onChange(item)}
          />
        )}
        keyExtractor={(item) => item.id ?? ''}
      />
    </>
  );
}
