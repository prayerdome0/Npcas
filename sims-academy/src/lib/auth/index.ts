import NextAuth from 'next-auth';
import { authOptions } from './options';

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth(authOptions);

export { authOptions };
