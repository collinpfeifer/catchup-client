import { useEffect, useState } from 'react';
import { Button, Form, Spinner, Text, Card, View } from 'tamagui';
import { gql, useMutation, useQuery } from 'urql';
import * as Contacts from 'expo-contacts';
import Question from '@/components/Question';
import { useForm } from 'react-hook-form';
import FlipCard from 'react-native-flip-card';
import formatPhoneNumber from '@/utils/formatPhoneNumber';

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
        <Card>
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
            <Form.Trigger asChild>
              <Button>Submit</Button>
            </Form.Trigger>
          </Form>
        </Card>
        <Card
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          {AnswersOfTheDayResult.data.answersOfTheDay.length > 0 ? (
            AnswersOfTheDayResult.data.answersOfTheDay.map((answer) => (
              <Text key={answer.id}>{answer.textAnswer}</Text>
            ))
          ) : (
            <Text>No one has answered you yet!</Text>
          )}
        </Card>
      </FlipCard>
    );
  }
}
