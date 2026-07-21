import { useEffect } from "react";

import { getPreferences } from "@/graphql/preference/preference";
import { usePreferencesStore } from "@/store/stores/preferencesStore";
import { useConversationsStore } from "@/store/stores/conversationsStore";

export const useChatInitialization = (conversations) => {
  const activeConversationId = useConversationsStore(
    (state) => state.activeConversationId,
  );

  const setActiveConversationId = useConversationsStore(
    (state) => state.setActiveConversationId,
  );

  const setConversations = useConversationsStore(
    (state) => state.setConversations,
  );

  const setPreferences = usePreferencesStore((state) => state.setPreferences);

  useEffect(() => {
    setConversations(conversations);

    const storedConversationId = localStorage.getItem("activeConversationId");

    if (!storedConversationId) {
      return;
    }

    const exists = conversations.some(
      (conversation) => conversation.id === storedConversationId,
    );

    if (exists) {
      setActiveConversationId(storedConversationId);
    }
  }, [conversations, setActiveConversationId, setConversations]);

  useEffect(() => {
    if (!activeConversationId) {
      return;
    }

    localStorage.setItem("activeConversationId", activeConversationId);
  }, [activeConversationId]);

  useEffect(() => {
    (async () => {
      const preferences = await getPreferences();

      if (!preferences) {
        return;
      }

      setPreferences(preferences);
    })();
  }, [setPreferences]);
};
