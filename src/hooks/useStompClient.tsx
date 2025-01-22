import { useEffect, useRef, useCallback, useState } from "react";
import { Client, StompSubscription } from "@stomp/stompjs";

// Define the custom StompSubscriptionWithUnsubscribe type
interface StompSubscriptionWithUnsubscribe extends StompSubscription {
  roomId: string;
  unsubscribe: () => void;
}

const useStompClient = (onMessage: (message: any) => void) => {
  const stompClientRef = useRef<Client | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [pendingSubscriptions, setPendingSubscriptions] = useState<StompSubscriptionWithUnsubscribe[]>([]);

  useEffect(() => {
    const stompClient = new Client({
      brokerURL: "ws://localhost:8080/ws-stomp",
      reconnectDelay: 5000,  // Reconnect every 5 seconds
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        console.log("Connected to WebSocket");
        setIsConnected(true);

        // Re-subscribe to any rooms that were pending
        pendingSubscriptions.forEach((subscription) => {
          subscription.unsubscribe();
          // Now re-subscribe
          const newSubscription = stompClientRef.current?.subscribe(
            `/sub/chat/room/${subscription.roomId}`,
            (message) => {
              onMessage(JSON.parse(message.body));
            }
          );
          // Replace the pending subscription with the active one
          setPendingSubscriptions((prev) =>
            prev.filter((sub) => sub.roomId !== subscription.roomId)
          );
          if (newSubscription) {
            setPendingSubscriptions((prev) => [
              ...prev,
              {
                ...subscription,
                unsubscribe: newSubscription.unsubscribe,  // Add unsubscribe function
                id: newSubscription.id,  // Add the id from the new subscription
              },
            ]);
          }
        });
        setPendingSubscriptions([]);  // Clear pending subscriptions
      },
      onDisconnect: () => {
        console.log("Disconnected from WebSocket");
        setIsConnected(false);
      },
      onWebSocketError: (error) => {
        console.error('WebSocket error:', error);
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
  }, []);

  const subscribeToRoom = useCallback(
    (roomId: string): StompSubscriptionWithUnsubscribe | null => {
      if (stompClientRef.current && isConnected) {
        const subscription = stompClientRef.current.subscribe(
          `/sub/chat/room/${roomId}`,
          (message) => {
            console.log("Received message:", message); // Log the received message
            onMessage(JSON.parse(message.body));
          }
        );

        // Return subscription with additional unsubscribe method and id
        const subscriptionWithUnsubscribe: StompSubscriptionWithUnsubscribe = {
          ...subscription,
          roomId,
          unsubscribe: subscription.unsubscribe,
          id: subscription.id,  // Ensure the subscription has an id
        };
        return subscriptionWithUnsubscribe;
      } else {
        console.warn("STOMP client not connected yet. Subscription deferred.");

        // If not connected, defer the subscription and try again once connected
        if (stompClientRef.current) {
          // Temporarily assign an empty id or a unique id for pending subscriptions
          const tempId = `temp-${Math.random().toString(36).substr(2, 9)}`;
          setPendingSubscriptions((prev) => [
            ...prev,
            { roomId, onMessage, unsubscribe: () => {}, id: tempId } // Provide a mock unsubscribe and id for pending subscriptions
          ]);
        }
        return null;
      }
    },
    [onMessage, isConnected]
  );

  const sendMessage = useCallback((destination: string, message: any) => {
    if (stompClientRef.current && stompClientRef.current.connected) {
      console.log("Sending message:", message); // Log the message being sent
      stompClientRef.current.publish({
        destination,
        body: JSON.stringify(message),
      });
    } else {
      console.warn("STOMP client not connected. Message not sent.");
    }
  }, []);

  return { subscribeToRoom, sendMessage, isConnected };
};

export default useStompClient;