import ChatLayout from "@/components/chat/ChatLayout";

import { getConversations } from "@/graphql/conversation/conversations";

export default async function ChatPage() {
  const conversations = await getConversations();

  return <ChatLayout conversations={conversations} />;
}
