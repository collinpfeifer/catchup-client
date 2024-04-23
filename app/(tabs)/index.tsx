import { useEffect, useState } from 'react';
import { Button, Form, Spinner, Text, View } from 'tamagui';
import { gql, useQuery } from 'urql';
import * as Contacts from 'expo-contacts';
import Question from '@/components/Question';
import { useForm } from 'react-hook-form';
import FlipCard from 'react-native-flip-card';

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

export default function QuestionOfTheDay() {
  const [contacts, setContacts] = useState<Array<Contacts.Contact>>([]);
  const [flipped, setFlipped] = useState(false);

  const [QuestionsOfTheDayResult] = useQuery({
    query: QuestionsOfTheDayQuery,
  });
  console.log(QuestionsOfTheDayResult);

  const [AnswersOfTheDayResult] = useQuery({
    query: AnswersOfTheDayQuery,
  });

  console.log(AnswersOfTheDayResult);

  const [UserAnswerExistsResult] = useQuery({
    query: UserAnswerExistsQuery,
  });

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

  if (QuestionsOfTheDayResult.fetching || AnswersOfTheDayResult.fetching) {
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

  if (QuestionsOfTheDayResult.error || AnswersOfTheDayResult.error) {
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
      <View>
        <Form
          onSubmit={handleSubmit((data) => {
            console.log(data);
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
          <Form.Trigger>
            <Button>
              <Text>Submit</Text>
            </Button>
          </Form.Trigger>
        </Form>
      </View>
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        {AnswersOfTheDayResult.data.answersOfTheDay.map((answer) => (
          <Text key={answer.id}>{answer.textAnswer}</Text>
        ))}
      </View>
    </FlipCard>
  );
}
