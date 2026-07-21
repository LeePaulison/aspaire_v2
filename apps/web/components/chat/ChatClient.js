"use client";

import { useEffect, useRef } from "react";
import { ScrollArea } from "radix-ui";

import MessageList from "./MessageList";
import MessageBubble from "./MessageBubble";
import ChatComposer from "./ChatComposer";

const SCROLL_END_THRESHOLD_PX = 96;

export const ChatClient = ({
  activeConversationId,
  messages,
  handleSendMessage,
  chatStatus,
}) => {
  const viewportRef = useRef(null);
  const stickToEndRef = useRef(true);
  const previousMessageCountRef = useRef(messages.length);

  const scrollToEnd = () => {
    const viewport = viewportRef.current;

    if (!viewport) return;

    viewport.scrollTo({ top: viewport.scrollHeight });
  };

  const handleScroll = (event) => {
    const viewport = event.currentTarget;
    const distanceFromEnd =
      viewport.scrollHeight - viewport.scrollTop - viewport.clientHeight;

    stickToEndRef.current = distanceFromEnd <= SCROLL_END_THRESHOLD_PX;
  };

  useEffect(() => {
    stickToEndRef.current = true;
    const frame = requestAnimationFrame(scrollToEnd);

    return () => cancelAnimationFrame(frame);
  }, [activeConversationId]);

  useEffect(() => {
    const lastMessage = messages.at(-1);
    const messageWasAdded = messages.length > previousMessageCountRef.current;

    if (messageWasAdded && lastMessage?.role === "user") {
      stickToEndRef.current = true;
    }

    previousMessageCountRef.current = messages.length;

    if (!stickToEndRef.current) return;

    const frame = requestAnimationFrame(scrollToEnd);

    return () => cancelAnimationFrame(frame);
  }, [messages, chatStatus]);

  return (
    <div className="flex flex-col w-full h-full overflow-hidden">
      <ScrollArea.Root className="ScrollAreaRoot">
        <ScrollArea.Viewport
          ref={viewportRef}
          className="ScrollAreaViewport"
          onScroll={handleScroll}
        >
          <MessageList>
            {messages.map((message, index) => (
              <MessageBubble
                key={message.id}
                role={message.role}
                content={message.content}
                attachments={message.attachments}
                status={chatStatus}
                isActive={
                  message.role === "assistant" &&
                  index === messages.length - 1
                }
              />
            ))}
          </MessageList>
        </ScrollArea.Viewport>
        <ScrollArea.Scrollbar
          className="ScrollAreaScrollbar"
          orientation="vertical"
        >
          <ScrollArea.Thumb className="ScrollAreaThumb" />
        </ScrollArea.Scrollbar>
        <ScrollArea.Corner className="ScrollAreaCorner" />
      </ScrollArea.Root>
      <ChatComposer
        onSendMessage={handleSendMessage}
        status={chatStatus}
      />
    </div>
  );
};
