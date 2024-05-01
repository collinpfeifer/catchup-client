import { useEffect, useState } from 'react';
import {
  Button,
  Form,
  Spinner,
  Text,
  Card,
  View,
  YStack,
  ScrollView,
  Avatar,
  XStack,
  Circle,
  Separator,
} from 'tamagui';
import { gql, useMutation, useQuery } from 'urql';
import * as Contacts from 'expo-contacts';
import Question from '@/components/Question';
import { useForm } from 'react-hook-form';
import FlipCard from 'react-native-flip-card';
import formatPhoneNumber from '@/utils/formatPhoneNumber';
import { FlatList } from 'react-native';

const QuestionsOfTheDayQuery = gql`
  query QuestionsOfTheDay {
    questionsOfTheDay {
      id
      question
      type
      responses
    }
  }
`;

const AnswersOfTheDayQuery = gql`
  query AnswersOfTheDay {
    answersOfTheDay {
      id
      type
      textAnswer
    }
  }
`;

const UserAnswerExistsQuery = gql`
  query UserAnswerExists {
    userAnswerExists
  }
`;

const AnswerQuestionMutation = gql`
  mutation AnswerQuestion(
    $answer: String!
    $id: ID!
    $previousAnswerId: ID
    $type: AnswerType!
  ) {
    answerQuestion(
      id: $id
      answer: $answer
      previousAnswerId: $previousAnswerId
      type: $type
    ) {
      id
    }
  }
`;

export default function QuestionOfTheDay() {
  const [contacts, setContacts] = useState<Array<Contacts.Contact>>([]);
  const [flipped, setFlipped] = useState(false);

  const [QuestionsOfTheDayResult] = useQuery({
    query: QuestionsOfTheDayQuery,
  });

  const [AnswersOfTheDayResult] = useQuery({
    query: AnswersOfTheDayQuery,
  });

  const [UserAnswerExistsResult] = useQuery({
    query: UserAnswerExistsQuery,
  });

  const [, answerQuestion] = useMutation(AnswerQuestionMutation);

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

  useEffect(() => {
    if (UserAnswerExistsResult?.data?.userAnswerExists) {
      setFlipped(true);
    }
  }, [UserAnswerExistsResult.data, UserAnswerExistsResult.error]);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm();

  if (
    QuestionsOfTheDayResult.fetching ||
    AnswersOfTheDayResult.fetching ||
    UserAnswerExistsResult.fetching
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
    QuestionsOfTheDayResult.error ||
    AnswersOfTheDayResult.error ||
    UserAnswerExistsResult.error
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
    const responses =
      QuestionsOfTheDayResult.data.questionsOfTheDay[0].responses;
    return (
      <FlipCard
        flip={flipped}
        clickable={false}
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: 100,
        }}>
        <Card
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'gray',
            borderColor: 'black',
            minWidth: '100%',
            marginBottom: 50,
          }}>
          <Text fontWeight='900' color='white' fontSize={25} marginTop='$3'>
            Question of the Day 🤔
          </Text>
          <Text color='white' fontSize={20} fontWeight='bold'>
            {responses} responses 🔥
          </Text>
          <Form
            onSubmit={handleSubmit(async (data) => {
              let previousAnswerId = null;
              for (const questionId in data) {
                const question =
                  QuestionsOfTheDayResult.data.questionsOfTheDay.find(
                    (question) => question.id === questionId
                  );
                if (question.type === 'TEXT') {
                  const result = await answerQuestion({
                    id: questionId,
                    answer: data[questionId],
                    previousAnswerId,
                    type: question.type,
                  });
                  console.log(result);
                  if (result.data)
                    previousAnswerId = result.data.answerQuestion.id;
                } else if (
                  question.type === 'USER' &&
                  data[questionId]?.phoneNumbers[0]?.number
                ) {
                  const result = await answerQuestion({
                    id: questionId,
                    answer: formatPhoneNumber(
                      data[questionId]?.phoneNumbers[0]?.number
                    ),
                    previousAnswerId,
                    type: question.type,
                  });
                  console.log(result);
                  if (result.data)
                    previousAnswerId = result.data.answerQuestion.id;
                }
              }
              if (previousAnswerId) {
                setFlipped(true);
              }
            })}>
            {QuestionsOfTheDayResult.data.questionsOfTheDay.map((question) => (
              <Question
                key={question.id}
                id={question.id}
                control={control}
                question={question.question}
                type={question.type}
                contacts={contacts}
              />
            ))}
            <Form.Trigger asChild marginTop='$6' zIndex={-1}>
              <Button backgroundColor='black'>
                <Text color='white' fontSize='$6'>
                  Submit
                </Text>
              </Button>
            </Form.Trigger>
          </Form>
        </Card>
        <Card
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'gray',
            minWidth: 400,
            marginBottom: 50,
            shadowColor: 'black',
            shadowOpacity: 0.2,
            shadowOffset: {
              width: 5,
              height: 5,
            },
          }}>
          <Text fontWeight='900' color='white' fontSize={25} marginTop='$3'>
            Question of the Day 🤔
          </Text>
          <Text color='white' fontSize={20} fontWeight='bold'>
            {responses} responses 🔥
          </Text>
          <Text
            color='white'
            fontSize={20}
            fontWeight='bold'
            maxWidth='90%'
            textAlign='center'>
            {QuestionsOfTheDayResult.data.questionsOfTheDay.map(
              (question) => question.question + ' '
            )}
          </Text>
          <Text fontWeight='900' color='white' fontSize={25} marginTop='$3'>
            Friends who answered you
          </Text>

          {AnswersOfTheDayResult.data.answersOfTheDay.length > 0 ? (
            <FlatList
              style={{ marginTop: 20 }}
              data={AnswersOfTheDayResult.data.answersOfTheDay}
              renderItem={({ item }) => (
                <Card key={item.id} minWidth='$20'>
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
          ) : (
            <Text>No one has answered you yet!</Text>
          )}
          {/* <Text fontWeight='900' color='white' fontSize={12} marginTop='$3'>
            Made by Collin ❤️
          </Text> */}
        </Card>
      </FlipCard>
    );
  }
}
