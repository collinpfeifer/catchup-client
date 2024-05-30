import Answer from '@/components/Answer';
import { router } from 'expo-router';
import { FlatList } from 'react-native';
import { Button, Card, Separator, Spinner, Text, View } from 'tamagui';
import { gql, useQuery } from 'urql';

const FriendFeedQuery = gql`
  query FriendFeed {
    friendFeed {
      answers {
        id
        textAnswer
        type
        user {
          id
        }
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
  const [FriendFeedResult, FriendFeedRefetch] = useQuery({
    query: FriendFeedQuery,
  });

  // FriendFeedResult.data.friendFeed = [
  //   {
  //     id: '1',
  //     friend: { id: '1', name: 'John' },
  //     answers: [
  //       { id: '1', textAnswer: 'He is awesome', type: 'TEXT' },
  //       { id: '2', textAnswer: 'Cool dude!!!', type: 'TEXT' },
  //     ],
  //   },
  // ];

  const [UserAnswerExistsResult] = useQuery({
    query: UserAnswerExistsQuery,
  });

  if (FriendFeedResult.fetching || UserAnswerExistsResult.fetching) {
    return (
      <View flex={1} justifyContent='center' alignItems='center'>
        <Spinner />
      </View>
    );
  } else if (FriendFeedResult.error || UserAnswerExistsResult.error) {
    return (
      <View flex={1} justifyContent='center' alignItems='center'>
        <Text>Something went wrong</Text>
      </View>
    );
  } else if (!UserAnswerExistsResult.data.userAnswerExists) {
    return (
      <View flex={1} justifyContent='center' alignItems='center'>
        <Text
          fontWeight='900'
          fontSize={24}
          textAlign='center'
          maxWidth={'90%'}>
          You haven't answered the Question of the Day 😫
        </Text>
      </View>
    );
  } else if (
    FriendFeedResult.data.friendFeed.length === 0 ||
    !FriendFeedResult.data.friendFeed.some(
      (friend: any) => friend.answers.length > 0
    )
  )
    return (
      <View flex={1} justifyContent='center' alignItems='center'>
        <Text
          fontWeight='900'
          fontSize={24}
          textAlign='center'
          maxWidth={'90%'}>
          No friends have been answered for the Question of the Day 😫
        </Text>
        <Button
          backgroundColor='black'
          marginTop={20}
          size='$4'
          onPress={() => router.replace('/add-friends')}>
          <Text color='white' fontWeight='900' fontSize='$6'>
            🎉 Add more friends! 🎉
          </Text>
        </Button>
      </View>
    );
  else {
    return (
      <View flex={1} justifyContent='center' alignItems='center'>
        <FlatList
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          style={{ marginTop: 100 }}
          data={FriendFeedResult.data.friendFeed}
          refreshing={FriendFeedResult.fetching}
          onRefresh={() => FriendFeedRefetch({ requestPolicy: 'network-only' })}
          renderItem={({ item }) => (
            <Card
              key={item.friend.id}
              flex={1}
              backgroundColor='black'
              justifyContent='center'
              borderRadius={20}
              marginTop={20}
              paddingBottom={20}>
              <Text
                fontWeight='900'
                fontSize={25}
                textAlign='left'
                marginTop='$3'
                color='white'
                marginLeft='$4'>
                {item.friend.name}
              </Text>
              <Separator marginTop='$2.5' />
              <View marginTop={20} marginHorizontal={10}>
                {item.answers.map((answer: any) => (
                  <Answer
                    id={answer.id}
                    textAnswer={answer.textAnswer}
                    answerUserId={answer.user.id}
                  />
                ))}
              </View>
            </Card>
          )}
          keyExtractor={(item) => item.id}
        />
      </View>
    );
  }
}
