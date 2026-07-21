"use client";

import { useEffect, useRef, useState } from "react";
import { decodeJwt } from "jose";

import { authClient } from "@/lib/auth/auth-client";
import {
  getReconnectDelay,
  shouldReconnect,
} from "@/lib/chat/reconnect";

const TOKEN_REFRESH_BUFFER_MS = 30_000;

function getTokenExpiration(token) {
  try {
    const { exp } = decodeJwt(token);

    return typeof exp === "number" ? exp * 1000 : null;
  } catch {
    return null;
  }
}

export const useChatSocket = ({
  onChatChunk,
  onChatComplete,
  onChatError,
  onError,
}) => {
  const websocketRef = useRef(null);
  const authenticatedRef = useRef(false);
  const callbacksRef = useRef({
    onChatChunk,
    onChatComplete,
    onChatError,
    onError,
  });
  const requestInFlightRef = useRef(false);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    callbacksRef.current = {
      onChatChunk,
      onChatComplete,
      onChatError,
      onError,
    };
  }, [onChatChunk, onChatComplete, onChatError, onError]);

  useEffect(() => {
    let cancelled = false;
    let websocket;
    let refreshTimeout;
    let reconnectTimeout;
    let reconnectAttempts = 0;

    function scheduleReconnect(error) {
      if (cancelled) return;

      const delay = getReconnectDelay(reconnectAttempts);
      if (delay === null) {
        callbacksRef.current.onError?.(
          error || new Error("Unable to reconnect to the chat service"),
        );
        return;
      }

      reconnectAttempts += 1;
      clearTimeout(reconnectTimeout);
      reconnectTimeout = setTimeout(connect, delay);
    }

    async function connect() {
      clearTimeout(reconnectTimeout);

      try {
        const { data, error } = await authClient.token();

        if (error) {
          throw new Error(error.message || "WebSocket token request failed");
        }

        const token = data?.token;

        if (!token) {
          throw new Error("WebSocket token response did not include a token");
        }

        if (cancelled) {
          return;
        }

        const websocketUrl = process.env.NEXT_PUBLIC_WS_SERVER;

        if (!websocketUrl) {
          throw new Error("NEXT_PUBLIC_WS_SERVER is not defined");
        }

        const socket = new WebSocket(websocketUrl);
        websocket = socket;
        websocketRef.current = socket;

        const isCurrentSocket = () =>
          !cancelled && websocketRef.current === socket;

        socket.onopen = () => {
          if (!isCurrentSocket()) {
            return;
          }

          socket.send(
            JSON.stringify({
              type: "authenticate",
              payload: { token },
            }),
          );
        };

        socket.onmessage = (event) => {
          if (!isCurrentSocket()) {
            return;
          }

          let message;

          try {
            message = JSON.parse(event.data);
          } catch {
            callbacksRef.current.onError?.(
              new Error("WebSocket server sent invalid JSON"),
            );
            return;
          }

          switch (message.type) {
            case "authenticated":
              reconnectAttempts = 0;
              authenticatedRef.current = true;
              setConnected(true);

              clearTimeout(refreshTimeout);

              const expiresAt = getTokenExpiration(token);
              const refreshDelay = expiresAt
                ? Math.max(0, expiresAt - Date.now() - TOKEN_REFRESH_BUFFER_MS)
                : 4 * 60 * 1000;

              refreshTimeout = setTimeout(() => {
                if (isCurrentSocket()) {
                  socket.close(4000, "Refreshing authentication");
                }
              }, refreshDelay);
              break;

            case "authentication_error":
              requestInFlightRef.current = false;
              authenticatedRef.current = false;
              setConnected(false);
              callbacksRef.current.onError?.(
                new Error(message.payload?.message || "Authentication failed"),
              );
              break;

            case "error":
              requestInFlightRef.current = false;
              callbacksRef.current.onChatError?.(
                new Error(message.payload?.message || "Chat request failed"),
              );
              break;

            case "chat_chunk":
              callbacksRef.current.onChatChunk?.(message.payload);
              break;

            case "chat_complete":
              requestInFlightRef.current = false;
              callbacksRef.current.onChatComplete?.(message.payload);
              break;

            default:
              console.warn("Unknown WS message:", message.type);
          }
        };

        socket.onerror = (error) => {
          if (!isCurrentSocket()) {
            return;
          }

          console.error("WebSocket error:", error);
        };

        socket.onclose = (event) => {
          if (!isCurrentSocket()) {
            return;
          }

          authenticatedRef.current = false;
          websocketRef.current = null;
          setConnected(false);

          clearTimeout(refreshTimeout);

          if (event.code === 4000) {
            connect();
          } else if (shouldReconnect(event.code)) {
            if (requestInFlightRef.current) {
              requestInFlightRef.current = false;
              callbacksRef.current.onChatError?.(
                new Error("The chat request was interrupted by a connection loss"),
              );
            }

            scheduleReconnect(
              new Error(
                event.reason || `WebSocket closed unexpectedly (${event.code})`,
              ),
            );
          } else {
            callbacksRef.current.onError?.(
              new Error(
                event.reason || `WebSocket closed (${event.code})`,
              ),
            );
          }
        };
      } catch (error) {
        if (error.name !== "AbortError") {
          scheduleReconnect(error);
        }
      }
    }

    connect();

    return () => {
      cancelled = true;
      clearTimeout(refreshTimeout);
      clearTimeout(reconnectTimeout);

      if (websocket) {
        websocket.onopen = null;
        websocket.onmessage = null;
        websocket.onerror = null;
        websocket.onclose = null;

        if (
          websocket.readyState === WebSocket.OPEN ||
          websocket.readyState === WebSocket.CONNECTING
        ) {
          websocket.close();
        }
      }

      if (websocketRef.current === websocket) {
        authenticatedRef.current = false;
        websocketRef.current = null;
        setConnected(false);
      }
    };
  }, []);

  const send = (message) => {
    const websocket = websocketRef.current;

    if (
      !authenticatedRef.current ||
      !websocket ||
      websocket.readyState !== WebSocket.OPEN
    ) {
      return false;
    }

    websocket.send(JSON.stringify(message));

    if (message.type === "chat_message") {
      requestInFlightRef.current = true;
    }

    return true;
  };

  return {
    connected,
    send,
  };
};
