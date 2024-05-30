import RandomColorGenerator from '@/utils/randomColorGenerator';
import { FontAwesome } from '@expo/vector-icons';
import {
  Card,
  XStack,
  Circle,
  Separator,
  Text,
  Popover,
  Button,
  YStack,
} from 'tamagui';
import { gql, useMutation } from 'urql';

const ReportAnswerMutation = gql`
  mutation ReportAnswer($answerId: ID!) {
    reportAnswer(answerId: $answerId)
  }
`;

const BlockUserMutation = gql`
  mutation BlockUser($userId: ID!, $answerId: ID!) {
    blockUser(userId: $userId, answerId: $answerId)
  }
`;

const HideAnswerMutation = gql`
  mutation HideAnswer($answerId: ID!) {
    hideAnswer(answerId: $answerId)
  }
`;

export default function Answer({
  id,
  answerUserId,
  textAnswer,
}: {
  id: string;
  answerUserId: string;
  textAnswer: string;
}) {
  const [, reportAnswer] = useMutation(ReportAnswerMutation);
  const [, blockUser] = useMutation(BlockUserMutation);
  const [, hideAnswer] = useMutation(HideAnswerMutation);

  return (
    <Card key={id} minWidth='$20' marginVertical='$2'>
      <XStack alignItems='center' justifyContent='space-between'>
        <XStack alignItems='center'>
          <Circle
            margin='$2'
            size={40}
            backgroundColor={RandomColorGenerator()}
            elevation='$4'>
            <Text color='white' fontWeight='900'>
              A
            </Text>
          </Circle>
          <Text color='gray' margin='$1.5' fontWeight='900'>
            Anonymous
          </Text>
        </XStack>
        <Popover>
          <Popover.Trigger marginRight='$3'>
            <FontAwesome name='ellipsis-h' size={20} color='black' />
          </Popover.Trigger>
          <Popover.Content>
            <Popover.Arrow />
            <Popover.Close />
            <YStack>
              <Button
                m='$1'
                onPress={() =>
                  hideAnswer({
                    answerId: id,
                  })
                }>
                <Text>Hide</Text>
              </Button>
              <Button
                m='$1'
                onPress={() =>
                  blockUser({
                    userId: answerUserId,
                    answerId: id,
                  })
                }>
                <Text>Block User</Text>
              </Button>
              <Button
                m='$1'
                onPress={() =>
                  reportAnswer({
                    answerId: id,
                  })
                }>
                <Text>Report</Text>
              </Button>
            </YStack>
          </Popover.Content>
        </Popover>
      </XStack>
      <Separator backgroundColor='black' />
      <Text margin='$4'>{textAnswer}</Text>
    </Card>
  );
}
