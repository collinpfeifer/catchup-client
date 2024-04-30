import { Link, router } from 'expo-router';
import { FlatList } from 'react-native';
import {
  Button,
  Card,
  Circle,
  Separator,
  Spinner,
  Text,
  View,
  XStack,
} from 'tamagui';
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

  // FriendFeedResult.data.friendFeed = [
  //   {
  //     id: '1',
  //     friend: { id: '1', name: 'John' },
  //     answers: [
  //       { id: '1', textAnswer: 'I am doing great!', type: 'TEXT' },
  //       { id: '2', textAnswer: 'I hate john!!!!', type: 'TEXT' },
  //     ],
  //   },
  // ];
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
        <Text
          fontWeight='900'
          fontSize={24}
          textAlign='center'
          maxWidth={'90%'}>
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
  else {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <FlatList
          style={{ marginTop: 100 }}
          data={FriendFeedResult.data.friendFeed}
          renderItem={({ item }) => (
            <Card
              key={item.friend.id}
              style={{
                flex: 1,
                backgroundColor: 'gray',
                justifyContent: 'center',
                borderRadius: 20,
              }}>
              <Text
                fontWeight='900'
                fontSize={25}
                textAlign='left'
                marginTop='$3'
                color='white'
                marginLeft='$4'>
                {item.friend.name}
              </Text>
              <FlatList
                style={{ marginTop: 20, marginHorizontal: 10 }}
                data={item.answers}
                renderItem={({ item }) => (
                  <Card key={item.id} minWidth='$20' marginVertical='$2'>
                    <XStack alignItems='center'>
                      <Circle
                        margin='$2'
                        size={40}
                        backgroundColor='$blue5Dark'
                        elevation='$4'>
                        <Text color='white' fontWeight='900'>
                          A
                        </Text>
                      </Circle>
                      <Text color='gray' margin='$1.5' fontWeight={'900'}>
                        Anonymous
                      </Text>
                    </XStack>
                    <Separator />
                    <Text margin='$4'>{item.textAnswer}</Text>
                  </Card>
                )}
                keyExtractor={(item) => item.id}
              />
            </Card>
          )}
          keyExtractor={(item) => item.id}
        />
      </View>
    );
  }
}
