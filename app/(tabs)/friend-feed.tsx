import { Text, View } from 'tamagui';
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

export default function FriendFeed() {
  const [FriendFeedResult] = useQuery({
    query: FriendFeedQuery,
  });
  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
      }}></View>
  );
}
