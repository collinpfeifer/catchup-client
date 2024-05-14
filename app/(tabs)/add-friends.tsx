import { FlatList } from 'react-native';
import AddFriendButtons from '@/components/AddFriendButtons';
import { Button, Input, ListItem, Spinner, Text, View } from 'tamagui';
import { gql, useMutation, useQuery } from 'urql';
import * as Contacts from 'expo-contacts';
import { useEffect, useState } from 'react';
import formatPhoneNumber from '@/utils/formatPhoneNumber';
import { useSession } from '@/context';
import contactSimilarity from '@/utils/contactSimilarity';
import DismissKeyboard from '@/components/DismissKeyboard';

const ReceivedFriendRequestsQuery = gql`
  query ReceivedFriendRequests {
    receivedFriendRequests {
      id
      sender {
        id
        name
        phoneNumber
      }
    }
  }
`;

const SentFriendRequestsQuery = gql`
  query SentFriendRequests {
    sentFriendRequests {
      id
      receiver {
        id
        name
        phoneNumber
      }
    }
  }
`;

const UsersInContactsQuery = gql`
  query UsersInContacts($contacts: [String!]!) {
    usersInContacts(contacts: $contacts) {
      id
      name
      phoneNumber
    }
  }
`;

const SendFriendRequestMutation = gql`
  mutation SendFriendRequest($userId: ID!) {
    sendFriendRequest(userId: $userId)
  }
`;

export default function AddFriends() {
  const { user } = useSession();
  const [contacts, setContacts] = useState<Array<Contacts.Contact>>([]);
  const [filteredContacts, setFilteredContacts] = useState<
    Array<Contacts.Contact>
  >([]);

  const [ReceivedFriendRequestsResult] = useQuery({
    query: ReceivedFriendRequestsQuery,
  });

  const [SentFriendRequestsResult, SentFriendRequestsRefetch] = useQuery({
    query: SentFriendRequestsQuery,
  });

  useEffect(() => {
    (async () => {
      const { status } = await Contacts.requestPermissionsAsync();
      if (status === 'granted') {
        const { data } = await Contacts.getContactsAsync({
          fields: [Contacts.Fields.Name, Contacts.Fields.PhoneNumbers],
        });

        if (data.length > 0) {
          setContacts(
            data.filter((contact) => contact?.phoneNumbers?.[0]?.number)
          );
        }
      }
    })();
  }, []);

  const [UsersInContactsResult] = useQuery({
    query: UsersInContactsQuery,
    variables: {
      contacts: contacts.map((contact) => {
        if (contact?.phoneNumbers?.[0]?.number)
          return formatPhoneNumber(contact?.phoneNumbers?.[0]?.number);
      }),
      pause: contacts?.length === 0,
    },
  });

  const [, sendFriendRequest] = useMutation(SendFriendRequestMutation);

  if (
    UsersInContactsResult.fetching ||
    ReceivedFriendRequestsResult.fetching ||
    SentFriendRequestsResult.fetching
  ) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <Spinner />
      </View>
    );
  } else if (
    UsersInContactsResult.error ||
    ReceivedFriendRequestsResult.error ||
    SentFriendRequestsResult.error
  ) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <Text>Something went wrong</Text>
      </View>
    );
  } else {
    return (
      <DismissKeyboard>
        <View
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          {contacts && contacts.length > 0 && (
            <>
              <Text
                marginTop={100}
                marginBottom={15}
                fontSize={25}
                fontWeight='900'>
                Search for Friends
              </Text>
              <Input
                minWidth='100%'
                placeholder={'Search for contacts to become friends with...'}
                onChangeText={(text) => {
                  setFilteredContacts(contactSimilarity(text, contacts));
                }}
              />
              <FlatList
                data={filteredContacts}
                renderItem={({ item }) => (
                  <ListItem minWidth='100%' key={item.id} borderRadius={15}>
                    <Text>{item.name}</Text>
                    <Text>{item.phoneNumbers?.[0]?.number}</Text>
                    <AddFriendButtons
                      item={item}
                      UsersInContactsResult={UsersInContactsResult}
                      ReceivedFriendRequestsResult={
                        ReceivedFriendRequestsResult
                      }
                      SentFriendRequestsResult={SentFriendRequestsResult}
                      sendFriendRequest={sendFriendRequest}
                      SentFriendRequestsRefetch={SentFriendRequestsRefetch}
                      user={user}
                    />
                  </ListItem>
                )}
                keyExtractor={(item, index) => item.id || index.toString()}
              />
            </>
          )}
        </View>
      </DismissKeyboard>
    );
  }
}
