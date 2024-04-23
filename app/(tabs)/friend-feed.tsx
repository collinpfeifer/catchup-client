import { Spinner, Text, View } from 'tamagui';
import { gql, useQuery } from 'urql';

const FriendFeedQuery = gql`
  query FriendFeed {
    friendFeed {
      answers {
        id
        textAnswer
        type
      }
      friend {
        id
        name
      }
    }
  }
`;

const UserAnswerExistsQuery = gql`
  query UserAnswerExists {
    userAnswerExists
  }
`;

export default function FriendFeed() {
  const [FriendFeedResult] = useQuery({
    query: FriendFeedQuery,
  });

  const [UserAnswerExistsResult] = useQuery({
    query: UserAnswerExistsQuery,
  });

  if (FriendFeedResult.fetching || UserAnswerExistsResult.fetching) {
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
  }

  if (FriendFeedResult.error || UserAnswerExistsResult.error) {
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
  }
  
  if (!UserAnswerExistsResult.data.userAnswerExists) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <Text>You haven't answered today's questions</Text>
      </View>
    );
  }

  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      {FriendFeedResult.data.friendFeed.map((friend) => (
        <View key={friend.friend.id}>
          <Text>{friend.friend.name}</Text>
          {friend.answers.map((answer) => (
            <Text key={answer.id}>{answer.textAnswer}</Text>
          ))}
        </View>
      ))}
    </View>
  );
}
