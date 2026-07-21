import { create } from "zustand";

export const useConversationsStore = create((set) => ({
  conversations: [],
  activeConversationId: null,
  setActiveConversationId: (id) => set({ activeConversationId: id }),
  setConversations: (conversations) => set({ conversations }),
  addConversation: (conversation) =>
    set((state) => ({ conversations: [conversation, ...state.conversations] })),
  updateConversation: (id, updates) =>
    set((state) => ({
      conversations: state.conversations.map((conversation) =>
        conversation.id === id ? { ...conversation, ...updates } : conversation,
      ),
    })),
  removeConversation: (id) =>
    set((state) => ({
      conversations: state.conversations.filter(
        (conversation) => conversation.id !== id,
      ),
    })),
}));
