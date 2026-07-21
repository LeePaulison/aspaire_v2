import { authRequest } from "@/graphql/authRequest";

const DELETE_CONVERSATION_MUTATION = `
  mutation DeleteConversation($id: ID!) {
    deleteConversation(id: $id)
  }
`;

export async function deleteConversation(id) {
  const result = await authRequest({
    query: DELETE_CONVERSATION_MUTATION,
    variables: { id },
  });

  return result.deleteConversation;
}
