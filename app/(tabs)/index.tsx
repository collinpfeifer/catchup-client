import { useEffect, useState } from 'react';
import {
  Button,
  Form,
  Spinner,
  Text,
  Card,
  View,
  YStack,
  useMedia,
} from 'tamagui';
import { gql, useMutation, useQuery } from 'urql';
import * as Contacts from 'expo-contacts';
import Question from '@/components/Question';
import { useForm } from 'react-hook-form';
import FlipCard from 'react-native-flip-card';
import formatPhoneNumber from '@/utils/formatPhoneNumber';
import { FlatList } from 'react-native';
import Answer from '@/components/Answer';
import DismissKeyboard from '@/components/DismissKeyboard';
import * as SMS from 'expo-sms';

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
  const media = useMedia();

  const [QuestionsOfTheDayResult] = useQuery({
    query: QuestionsOfTheDayQuery,
  });

  const [AnswersOfTheDayResult, AnswersOfTheDayRefetch] = useQuery({
    query: AnswersOfTheDayQuery,
  });

  // AnswersOfTheDayResult.data.answersOfTheDay = [
  //   { id: '1', textAnswer: 'He is awesome', type: 'TEXT' },
  //   { id: '2', textAnswer: 'Cool dude!!!', type: 'TEXT' },
  // ];

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
          setContacts(
            data.filter((contact) => contact?.phoneNumbers?.[0]?.number)
          );
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
      <DismissKeyboard>
        <FlipCard
          flip={flipped}
          clickable={false}
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: media.short ? 20 : 120,
            margin: 'auto',
            maxWidth: 500,
            //marginTop: 120
          }}>
          <Card
            style={{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'black',
              borderColor: 'black',
              minWidth: '100%',
              marginBottom: 40,
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
                      (question: any) => question.id === questionId
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
              {QuestionsOfTheDayResult.data.questionsOfTheDay.map(
                (question: any) => (
                  <Question
                    key={question.id}
                    id={question.id}
                    control={control}
                    question={question.question}
                    type={question.type}
                    contacts={contacts}
                  />
                )
              )}
              <Form.Trigger asChild marginTop='$6' zIndex={-1}>
                <Button>
                  <Text fontSize='$6'>Submit</Text>
                </Button>
              </Form.Trigger>
            </Form>
          </Card>
          <Card
            style={{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'black',
              borderColor: 'black',
              minWidth: '100%',
              marginBottom: 40,
            }}>
            <Text
              fontWeight='900'
              color='white'
              fontSize={25}
              marginTop={
                AnswersOfTheDayResult.data.answersOfTheDay.length > 0
                  ? '$3'
                  : '$-20'
              }>
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
                (question: any) => question.question + ' '
              )}
            </Text>
            <Text fontWeight='900' color='white' fontSize={25} marginTop='$3'>
              Friends who answered you
            </Text>
            {AnswersOfTheDayResult.data.answersOfTheDay.length > 0 ? (
              <FlatList
                style={{ marginTop: 20 }}
                data={AnswersOfTheDayResult.data.answersOfTheDay}
                refreshing={AnswersOfTheDayResult.fetching}
                onRefresh={() =>
                  AnswersOfTheDayRefetch({ requestPolicy: 'network-only' })
                }
                renderItem={({ item }) => (
                  <Answer id={item.id} textAnswer={item.textAnswer} />
                )}
                keyExtractor={(item) => item.id}
              />
            ) : (
              <View marginTop='$14'>
                <Text
                  color='white'
                  fontWeight='900'
                  fontSize={20}
                  textAlign='center'>
                  No one has answered you yet! 😢
                </Text>
                <Button
                  marginTop='$3'
                  backgroundColor='$red10Dark'
                  borderRadius={50}
                  borderColor='white'
                  onPress={async () => {
                    const isAvailable = await SMS.isAvailableAsync();
                    if (isAvailable) {
                      const { result } = await SMS.sendSMSAsync(
                        [],
                        'Hey! Want to know what your friends think about you? Join Catch-Up to find out! https://catch-up.vercel.app/'
                      );
                      console.log(result);
                    } else {
                      // misfortune... there's no SMS available on this device
                    }
                  }}>
                  <Text
                    color='white'
                    fontWeight='900'
                    fontSize={18}
                    textAlign='center'>
                    Invite your friends 🤗
                  </Text>
                </Button>
              </View>
            )}
          </Card>
        </FlipCard>
      </DismissKeyboard>
    );
  }
}
