import { StatusBar } from 'expo-status-bar';
import { FlatList, Platform, StyleSheet } from 'react-native';

import { Button, ListItem, Spinner, Text, View } from 'tamagui';
import { gql, useMutation, useQuery } from 'urql';
import * as Contacts from 'expo-contacts';
import { useEffect, useState } from 'react';
import formatPhoneNumber from '@/utils/formatPhoneNumber';
import { useSession } from '@/context';

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

const AcceptFriendRequestMutation = gql`
  mutation AcceptFriendRequest($friendRequestId: ID!) {
    acceptFriendRequest(friendRequestId: $friendRequestId)
  }
`;

const RejectFriendRequestMutation = gql`
  mutation RejectFriendRequest($friendRequestId: ID!) {
    rejectFriendRequest(friendRequestId: $friendRequestId)
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

  const [ReceivedFriendRequestsResult] = useQuery({
    query: ReceivedFriendRequestsQuery,
  });

  const [SentFriendRequestsResult] = useQuery({
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

  const [, acceptFriendRequest] = useMutation(AcceptFriendRequestMutation);
  const [, rejectFriendRequest] = useMutation(RejectFriendRequestMutation);
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
        {ReceivedFriendRequestsResult?.data?.receivedFriendRequests &&
          ReceivedFriendRequestsResult?.data?.receivedFriendRequests.length >
            0 && (
            <>
              <Text>Friend Requests</Text>
              <FlatList
                data={
                  ReceivedFriendRequestsResult?.data?.receivedFriendRequests
                }
                renderItem={({ item }) => (
                  <ListItem key={item.id} borderRadius={15}>
                    <Text>{item.sender.name}</Text>
                    <Text>{item.sender.phoneNumber}</Text>
                    <Button
                      onPress={() =>
                        acceptFriendRequest({
                          friendRequestId: item.id,
                        })
                      }>
                      <Text>Accept</Text>
                    </Button>
                    <Button
                      onPress={() =>
                        rejectFriendRequest({
                          friendRequestId: item.id,
                        })
                      }>
                      <Text>Reject</Text>
                    </Button>
                  </ListItem>
                )}
                keyExtractor={(item) => item.id}
              />
            </>
          )}
        {contacts && contacts.length > 0 && (
          <>
            <Text
              marginLeft={-200}
              marginTop={50}
              marginBottom={5}
              fontSize={25}
              fontWeight={'900'}>
              Users in Contacts
            </Text>
            <FlatList
              data={contacts}
              renderItem={({ item }) => (
                <ListItem minWidth={440} key={item.id} borderRadius={15}>
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
                          onPress={() =>
                            sendFriendRequest({
                              userId:
                                UsersInContactsResult.data.usersInContacts.find(
                                  (user) =>
                                    user.phoneNumber ===
                                    formatPhoneNumber(
                                      item?.phoneNumbers?.[0]?.number || ''
                                    )
                                )?.id,
                            })
                          }>
                          Add
                        </Button>
                      )
                    : SentFriendRequestsResult.data.sentFriendRequests.find(
                        (friendRequest) =>
                          friendRequest.receiver.phoneNumber ===
                          formatPhoneNumber(
                            item?.phoneNumbers?.[0]?.number || ''
                          )
                      ) && <Button disabled>Sent</Button>}
                </ListItem>
              )}
              keyExtractor={(item) => item.id}
            />
          </>
        )}

        {/* Use a light status bar on iOS to account for the black space above the modal */}
        <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
      </View>
    );
  }
}
