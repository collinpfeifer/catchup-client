import { Button, Text } from 'tamagui';
import * as Contacts from 'expo-contacts';
import formatPhoneNumber from '@/utils/formatPhoneNumber';

export default function AddFriendButtons({
  item,
  UsersInContactsResult,
  ReceivedFriendRequestsResult,
  SentFriendRequestsResult,
  sendFriendRequest,
  SentFriendRequestsRefetch,
  user,
}: {
  item: Contacts.Contact;
  UsersInContactsResult: any;
  ReceivedFriendRequestsResult: any;
  SentFriendRequestsResult: any;
  sendFriendRequest: any;
  SentFriendRequestsRefetch: any;
  user: any;
}) {
  const contactPhoneNumber = formatPhoneNumber(item?.phoneNumbers?.[0]?.number);
  if (
    UsersInContactsResult.data.usersInContacts.some(
      (user) => user?.phoneNumber === contactPhoneNumber
    ) &&
    user?.phoneNumber !== contactPhoneNumber
  ) {
    if (
      ReceivedFriendRequestsResult.data.receivedFriendRequests.some(
        (user) => user.sender.phoneNumber === contactPhoneNumber
      )
    ) {
      return (
        <Button backgroundColor='white' borderColor='black' disabled>
          <Text color='black' fontSize='$6'>
            Pending
          </Text>
        </Button>
      );
    } else if (
      SentFriendRequestsResult.data.sentFriendRequests.some(
        (user) => user.receiver.phoneNumber === contactPhoneNumber
      )
    )
      return (
        <Button backgroundColor='white' borderColor='black' disabled>
          <Text color='black' fontSize='$6'>
            Sent
          </Text>
        </Button>
      );
    else
      return (
        <Button
          backgroundColor='black'
          onPress={async () => {
            await sendFriendRequest({
              userId: UsersInContactsResult.data.usersInContacts.find(
                (user) =>
                  user.phoneNumber ===
                  formatPhoneNumber(item?.phoneNumbers?.[0]?.number || '')
              )?.id,
            });
            SentFriendRequestsRefetch({
              requestPolicy: 'network-only',
            });
          }}>
          <Text color='white' fontSize='$6'>
            Add
          </Text>
        </Button>
      );
  }
}
