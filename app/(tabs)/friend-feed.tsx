import { Link, router } from 'expo-router';
import { Button, Spinner, Text, View } from 'tamagui';
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
  } else if (FriendFeedResult.error || UserAnswerExistsResult.error) {
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
  } else if (!UserAnswerExistsResult.data.userAnswerExists) {
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
  } else if (
    FriendFeedResult.data.friendFeed.length === 0 ||
    !FriendFeedResult.data.friendFeed.some(
      (friend) => friend.answers.length > 0
    )
  )
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <Text fontWeight='900' fontSize={24} textAlign='center'>
          No friends have been answered for the Question of the Day 😫
        </Text>
        <Button
          backgroundColor='gray'
          marginTop={20}
          size='$4'
          onPress={() => router.push('/add-friends')}>
          <Text color='white' fontWeight='900' fontSize='$6'>
            🎉 Add more friends! 🎉
          </Text>
        </Button>
      </View>
    );
  else
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
