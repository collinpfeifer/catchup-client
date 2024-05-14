import * as Contacts from 'expo-contacts';

function levenshteinDistance(str1: string, str2: string): number {
  const m = str1.length;
  const n = str2.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () =>
    Array(n + 1).fill(0)
  );

  for (let i = 0; i <= m; i++) {
    for (let j = 0; j <= n; j++) {
      if (i === 0) dp[i][j] = j;
      else if (j === 0) dp[i][j] = i;
      else {
        const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
        dp[i][j] = Math.min(
          dp[i - 1][j] + 1,
          dp[i][j - 1] + 1,
          dp[i - 1][j - 1] + cost
        );
      }
    }
  }

  return dp[m][n];
}

export default function contactSimilarity(
  input: string,
  contactArray: Array<Contacts.Contact>,
  threshold: number = 0.5
): Array<Contacts.Contact> {
  const similarContacts: Array<Contacts.Contact> = [];

  for (const contact of contactArray) {
    const name = contact.name || contact.firstName + ' ' + contact.lastName;
    const similarity =
      1 -
      levenshteinDistance(input, name) / Math.max(input.length, name.length);
    if (similarity >= threshold) {
      similarContacts.push(contact);
    }
  }

  return similarContacts;
}
