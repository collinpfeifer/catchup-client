import { Redirect } from 'expo-router';
import { FlatList } from 'react-native';
import { Button, ListItem, View, Text, Spinner } from 'tamagui';
import { gql, useMutation, useQuery } from 'urql';

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

export default function FriendRequests() {
  const [ReceivedFriendRequestsResult, ReceivedFriendRequestsRefetch] =
    useQuery({
      query: ReceivedFriendRequestsQuery,
    });

  const [, acceptFriendRequest] = useMutation(AcceptFriendRequestMutation);
  const [, rejectFriendRequest] = useMutation(RejectFriendRequestMutation);

  if (ReceivedFriendRequestsResult.fetching) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <Spinner />
      </View>
    );
  } else if (ReceivedFriendRequestsResult.error) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
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
        <Text marginTop={40} marginBottom={15} fontSize={25} fontWeight='900'>
          Friend Requests
        </Text>

        {ReceivedFriendRequestsResult?.data?.receivedFriendRequests &&
        ReceivedFriendRequestsResult?.data?.receivedFriendRequests.length >
          0 ? (
          <FlatList
            data={ReceivedFriendRequestsResult?.data?.receivedFriendRequests}
            refreshing={ReceivedFriendRequestsResult.fetching}
            onRefresh={() =>
              ReceivedFriendRequestsRefetch({ requestPolicy: 'network-only' })
            }
            renderItem={({ item }) => (
              <ListItem key={item.id} borderRadius={15}>
                <Text>{item.sender.name}</Text>
                <Text>{item.sender.phoneNumber}</Text>
                <Button
                  onPress={async () => {
                    await acceptFriendRequest({
                      friendRequestId: item.id,
                    });
                    ReceivedFriendRequestsRefetch({
                      requestPolicy: 'network-only',
                    });
                  }}>
                  <Text>Accept</Text>
                </Button>
                <Button
                  onPress={async () => {
                    await rejectFriendRequest({
                      friendRequestId: item.id,
                    });
                    ReceivedFriendRequestsRefetch({
                      requestPolicy: 'network-only',
                    });
                  }}>
                  <Text>Reject</Text>
                </Button>
              </ListItem>
            )}
            keyExtractor={(item) => item.id}
          />
        ) : (
          <Redirect href='/add-friends' />
        )}
      </View>
    );
  }
}
