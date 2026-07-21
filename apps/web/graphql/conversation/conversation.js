import { authRequest } from "@/graphql/authRequest";

const GET_CONVERSATION_QUERY = `
  query GetConversation($id: ID!) {
    conversation(id: $id) {
      id
      userId
      createdAt
      updatedAt
      messages {
        role
        content
        createdAt
      }
    }
  }
`;

export async function getConversation(id) {
  const result = await authRequest({
    query: GET_CONVERSATION_QUERY,
    variables: {
      id,
    },
  });

  return result.conversation;
}
