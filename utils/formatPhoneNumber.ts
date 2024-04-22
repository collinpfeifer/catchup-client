import { parsePhoneNumber } from 'libphonenumber-js';

export default function formatPhoneNumber(phoneNumber: string): string {
  return parsePhoneNumber(phoneNumber, 'US')?.format('E.164');
}
