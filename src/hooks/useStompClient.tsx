import { useEffect, useRef, useCallback, useState } from "react";
import { Client, StompSubscription } from "@stomp/stompjs";

interface StompSubscriptionWithUnsubscribe extends StompSubscription {
  roomId: string;
  unsubscribe: () => void;
}

const useStompClient = (onMessage: (message: any) => void) => {
  const stompClientRef = useRef<Client | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [pendingSubscriptions, setPendingSubscriptions] = useState<StompSubscriptionWithUnsubscribe[]>([]);
  const subscribedRooms = useRef<Set<string>>(new Set()); // Track currently subscribed rooms

  useEffect(() => {
    const stompClient = new Client({
      brokerURL: "ws://localhost:8080/ws-stomp",
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        console.log("Connected to WebSocket");
        setIsConnected(true);

        // Re-subscribe to any pending subscriptions
        pendingSubscriptions.forEach((subscription) => {
          const isSubscribed = subscribedRooms.current.has(subscription.roomId);
          if (!isSubscribed) {
            const newSubscription = stompClientRef.current?.subscribe(
              `/sub/chat/room/${subscription.roomId}`,
              (message) => {
                onMessage(JSON.parse(message.body));
              }
            );
            if (newSubscription) {
              setPendingSubscriptions((prev) => [
                ...prev,
                {
                  ...subscription,
                  unsubscribe: newSubscription.unsubscribe,
                  id: newSubscription.id,
                },
              ]);
              subscribedRooms.current.add(subscription.roomId); // Mark as subscribed
            }
          }
        });
        setPendingSubscriptions([]); // Clear pending subscriptions after re-subscribing
      },
      onDisconnect: () => {
        console.log("Disconnected from WebSocket");
        setIsConnected(false);
      },
      onWebSocketError: (error) => {
        console.error("WebSocket error:", error);
      },
      onStompError: (frame) => {
        console.error("STOMP error:", frame);
      },
    });

    stompClientRef.current = stompClient;
    stompClient.activate();

    return () => {
      if (stompClientRef.current) {
        stompClientRef.current.deactivate();
        stompClientRef.current = null;
        setIsConnected(false);
      }
    };
  }, []); // Runs once on mount and setup of WebSocket

  const unsubscribeFromRoom = useCallback((roomId: string) => {
    const subscription = pendingSubscriptions.find((sub) => sub.roomId === roomId);

    if (subscription && subscribedRooms.current.has(roomId)) {
      console.log(`Unsubscribing from room: ${roomId}`);
      subscription.unsubscribe();
      subscribedRooms.current.delete(roomId);
    } else {
      console.warn(`Cannot unsubscribe from room: ${roomId}. Not found.`);
    }
  }, [pendingSubscriptions]);

  const subscribeToRoom = useCallback(
    (roomId: string): StompSubscriptionWithUnsubscribe | null => {
      if (!roomId) {
        console.warn("Room ID is empty. Cannot subscribe.");
        return null;
      }

      // Unsubscribe from the current room if the roomId is different
      if (subscribedRooms.current.has(roomId)) {
        console.log(`Already subscribed to room: ${roomId}`);
        return null; // Already subscribed, no action needed
      } else {
        const currentRoom = Array.from(subscribedRooms.current)[0]; // Assuming 1 room is subscribed at a time
        if (currentRoom && currentRoom !== roomId) {
          console.log(`Switching from room: ${currentRoom} to room: ${roomId}`);
          unsubscribeFromRoom(currentRoom); // Unsubscribe from old room before subscribing to new one
        }

        if (stompClientRef.current && isConnected) {
          const subscription = stompClientRef.current.subscribe(
            `/sub/chat/room/${roomId}`,
            (message) => {
              console.log("Received message:", message.body);
              onMessage(JSON.parse(message.body));
            }
          );

          subscribedRooms.current.add(roomId); // Track the newly subscribed room
          console.log(`Subscribed to room: ${roomId}`);

          const subscriptionWithUnsubscribe: StompSubscriptionWithUnsubscribe = {
            ...subscription,
            roomId,
            unsubscribe: () => {
              console.log(`Unsubscribing from room: ${roomId}`);
              subscription.unsubscribe();
              subscribedRooms.current.delete(roomId); // Clean up on unsubscribe
            },
          };

          setPendingSubscriptions((prev) => [...prev, subscriptionWithUnsubscribe]);

          return subscriptionWithUnsubscribe;
        } else {
          console.warn("STOMP client not connected yet. Subscription deferred.");
          const tempId = `temp-${Math.random().toString(36).substr(2, 9)}`;
          setPendingSubscriptions((prev) => [
            ...prev,
            { roomId, unsubscribe: () => {}, id: tempId },
          ]);
          return null;
        }
      }
    },
    [onMessage, isConnected, unsubscribeFromRoom]
  );

  const sendMessage = useCallback((destination: string, message: any) => {
    if (stompClientRef.current && stompClientRef.current.connected) {
      console.log(`Sending message to ${destination}:`, message);
      stompClientRef.current.publish({
        destination,
        body: JSON.stringify(message),
      });
    } else {
      console.warn("STOMP client not connected. Message not sent.");
    }
  }, []);

  return { subscribeToRoom, unsubscribeFromRoom, sendMessage, isConnected };
};

export default useStompClient;