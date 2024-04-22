import { StatusBar } from 'expo-status-bar';
import { Platform, StyleSheet } from 'react-native';

import { Text, View } from 'tamagui';
import { gql, useMutation, useQuery } from 'urql';
import * as Contacts from 'expo-contacts';
import { useEffect, useState } from 'react';

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
  const [contracts, setContacts] = useState<Array<Contacts.Contact>>();
  const [FriendRequestsResult] = useQuery({
    query: FriendRequestsQuery,
  });

  const [, acceptFriendRequest] = useMutation(AcceptFriendRequestMutation);
  const [, rejectFriendRequest] = useMutation(RejectFriendRequestMutation);
  const [, sendFriendRequest] = useMutation(SendFriendRequestMutation);

  useEffect(() => {
    (async () => {
      const { status } = await Contacts.requestPermissionsAsync();
      if (status === 'granted') {
        const { data } = await Contacts.getContactsAsync({
          fields: [Contacts.Fields.Emails],
        });

        if (data.length > 0) {
          setContacts(data);
        }
      }
    })();
  }, []);

  return (
    <View>
      {/* Use a light status bar on iOS to account for the black space above the modal */}
      <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
    </View>
  );
}
