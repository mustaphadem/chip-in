import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import { findOrCreateUser } from "./lib/findOrCreateUser";
 
export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [Google],
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account && token.email) {
        const user = await findOrCreateUser(
          token.email,
          token.name
        );

        (token as any).userId = user.id;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user && (token as any).userId) {
        (session.user as any).id = (token as any).userId;
      }
      return session;
    },
  }
})