import { StatusBar } from 'expo-status-bar';
import { Platform, StyleSheet } from 'react-native';

import { Button, ListItem, Spinner, Text, View } from 'tamagui';
import { gql, useMutation, useQuery } from 'urql';
import * as Contacts from 'expo-contacts';
import { useEffect, useState } from 'react';
import formatPhoneNumber from '@/utils/formatPhoneNumber';

const FriendRequestsQuery = gql`
  query FriendRequests {
    friendRequests {
      id
      sender {
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
  const [contacts, setContacts] = useState<Array<Contacts.Contact>>([]);

  const [FriendRequestsResult] = useQuery({
    query: FriendRequestsQuery,
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

  if (UsersInContactsResult.fetching || FriendRequestsResult.fetching) {
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
  } else if (UsersInContactsResult.error || FriendRequestsResult.error) {
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
  } else
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        {FriendRequestsResult?.data?.friendRequests?.map((friendRequest) => (
          <View key={friendRequest.id}>
            <Text>{friendRequest.sender.name}</Text>
            <Text>{friendRequest.sender.phoneNumber}</Text>
            <Button
              onPress={() =>
                acceptFriendRequest({ friendRequestId: friendRequest.id })
              }>
              <Text>Accept</Text>
            </Button>
            <Button
              onPress={() =>
                rejectFriendRequest({ friendRequestId: friendRequest.id })
              }>
              <Text>Reject</Text>
            </Button>
          </View>
        ))}
        <Text>Users in Contacts</Text>
        {contacts.map((contact) => (
          <ListItem key={contact.id}>
            <Text>{contact.name}</Text>
            <Text>{contact.phoneNumbers?.[0]?.number}</Text>
            {UsersInContactsResult.data.usersInContacts.find(
              (user) =>
                user.phoneNumber ===
                formatPhoneNumber(contact?.phoneNumbers?.[0]?.number || '')
            ) && (
              <Button
                onPress={() =>
                  sendFriendRequest({
                    userId: UsersInContactsResult.data.usersInContacts.find(
                      (user) =>
                        user.phoneNumber ===
                        formatPhoneNumber(
                          contact?.phoneNumbers?.[0]?.number || ''
                        )
                    )?.id,
                  })
                }>
                <Text>Add</Text>
              </Button>
            )}
          </ListItem>
        ))}
        {/* Use a light status bar on iOS to account for the black space above the modal */}
        <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
      </View>
    );
}
