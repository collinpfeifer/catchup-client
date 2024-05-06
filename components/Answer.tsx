import RandomColorGenerator from '@/utils/randomColorGenerator';
import { Card, XStack, Circle, Separator, Text } from 'tamagui';

export default function Answer({
  id,
  textAnswer,
}: {
  id: string;
  textAnswer: string;
}) {
  return (
    <Card key={id} minWidth='$20'>
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
        <Text color='gray' margin='$1.5' fontWeight={'900'}>
          Anonymous
        </Text>
      </XStack>
      <Separator />
      <Text margin='$4'>{textAnswer}</Text>
    </Card>
  );
}
