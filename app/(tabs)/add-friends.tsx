import { StatusBar } from 'expo-status-bar';
import { FlatList, Platform, StyleSheet } from 'react-native';

import { Button, Input, ListItem, Spinner, Text, View } from 'tamagui';
import { gql, useMutation, useQuery } from 'urql';
import * as Contacts from 'expo-contacts';
import { useEffect, useState } from 'react';
import formatPhoneNumber from '@/utils/formatPhoneNumber';
import { useSession } from '@/context';
import contactSimilarity from '@/utils/contactSimilarity';

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

  const [SentFriendRequestsResult, SendFriendRequestsRefetch] = useQuery({
    query: SentFriendRequestsQuery,
  });

  const [UsersInContactsResult] = useQuery({
    query: UsersInContactsQuery,
    variables: {
      contacts: contacts.map((contact) =>
        formatPhoneNumber(contact?.phoneNumbers?.[0]?.number || '')
      ),
      pause: contacts.length === 0,
    },
  });

  const [, sendFriendRequest] = useMutation(SendFriendRequestMutation);

  useEffect(() => {
    (async () => {
      const { status } = await Contacts.requestPermissionsAsync();
      if (status === 'granted') {
        const { data } = await Contacts.getContactsAsync({
          fields: [Contacts.Fields.Name, Contacts.Fields.PhoneNumbers],
        });

        if (data.length > 0) {
          setContacts(data);
        }
      }
    })();
  }, []);

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
                  {UsersInContactsResult.data.usersInContacts.find(
                    (user) =>
                      user.phoneNumber ===
                      formatPhoneNumber(item?.phoneNumbers?.[0]?.number || '')
                  ) &&
                  user?.phoneNumber !==
                    formatPhoneNumber(item?.phoneNumbers?.[0]?.number || '')
                    ? !ReceivedFriendRequestsResult.data.receivedFriendRequests.find(
                        (friendRequest) =>
                          friendRequest.sender.phoneNumber ===
                          formatPhoneNumber(
                            item?.phoneNumbers?.[0]?.number || ''
                          )
                      ) && (
                        <Button
                          backgroundColor='black'
                          onPress={async () => {
                            await sendFriendRequest({
                              userId:
                                UsersInContactsResult.data.usersInContacts.find(
                                  (user) =>
                                    user.phoneNumber ===
                                    formatPhoneNumber(
                                      item?.phoneNumbers?.[0]?.number || ''
                                    )
                                )?.id,
                            });
                            SendFriendRequestsRefetch();
                          }}>
                          <Text color='white' fontSize='$6'>
                            Add
                          </Text>
                        </Button>
                      )
                    : SentFriendRequestsResult.data.sentFriendRequests.find(
                        (friendRequest) =>
                          friendRequest.receiver.phoneNumber ===
                          formatPhoneNumber(
                            item?.phoneNumbers?.[0]?.number || ''
                          )
                      ) && (
                        <Button backgroundColor='black' disabled>
                          <Text color='white' fontSize='$6'>
                            Sent
                          </Text>
                        </Button>
                      )}
                </ListItem>
              )}
              keyExtractor={(item) => item.id}
            />
          </>
        )}
      </View>
    );
  }
}
