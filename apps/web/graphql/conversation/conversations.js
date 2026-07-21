import { serverAuthRequest } from "@/graphql/serverAuthRequest";

export async function getConversations() {
  const result = await serverAuthRequest({
    query: `
      query Conversations {
        conversations {
          id
          updatedAt
          preview
        }
      }
    `,
  });

  return result.conversations;
}
