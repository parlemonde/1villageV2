import { createRandomStringGenerator } from '@better-auth/utils/random';

const generateRandomString = createRandomStringGenerator('A-Z', '0-9', 'a-z');
export const generateInviteCode = () => generateRandomString(10);
