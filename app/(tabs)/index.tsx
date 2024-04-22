import { useEffect, useState } from 'react';
import { Text, View } from 'tamagui';
import { gql, useQuery } from 'urql';
import * as Contacts from 'expo-contacts';

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
export default function QuestionOfTheDay() {
  const [contacts, setContacts] = useState<Array<Contacts.Contact>>();
  const [QuestionsOfTheDayResult] = useQuery({
    query: QuestionsOfTheDayQuery,
  });
  console.log(QuestionsOfTheDayResult);

  const [AnswersOfTheDayResult] = useQuery({
    query: AnswersOfTheDayQuery,
  });

  console.log(AnswersOfTheDayResult);

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

  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
      }}></View>
  );
}
