import { useEffect, useRef, useCallback, useState } from "react";
import { Client, StompSubscription } from "@stomp/stompjs";

interface StompSubscriptionWithUnsubscribe extends StompSubscription {
  subscriptionPath: string;
  unsubscribe: () => void;
}

const useStompClient = (onMessage: (message: any) => void) => {
  const stompClientRef = useRef<Client | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const subscribedRooms = useRef<Set<string>>(new Set());
  const activeSubscriptions = useRef<Map<string, StompSubscriptionWithUnsubscribe>>(new Map());

  const initializeStompClient = useCallback(() => {
    if (stompClientRef.current) return; // Avoid multiple instances

    console.log("Initializing STOMP client...");
    const client = new Client({
      brokerURL: "ws://localhost:8080/ws-stomp",
      reconnectDelay: 5000, // Handles normal disconnects
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        console.log("Connected to WebSocket");
        setIsConnected(true);
        resubscribeToRooms();
      },
      onDisconnect: () => {
        console.log("Disconnected from WebSocket");
        setIsConnected(false);
        clearAllSubscriptions();
      },
      onWebSocketError: (error) => console.error("WebSocket error:", error),
      onStompError: (frame) => console.error("STOMP error:", frame),
    });

    stompClientRef.current = client;
    client.activate();
  }, []);

  const forceReconnect = useCallback(() => {
    if (stompClientRef.current) {
      console.log("Forcing WebSocket reconnect...");
      stompClientRef.current.forceDisconnect(); // Ensure it's fully stopped
      stompClientRef.current = null;
    }
    setIsConnected(false);
    initializeStompClient();
  }, [initializeStompClient]);

  const clearAllSubscriptions = () => {
    activeSubscriptions.current.forEach((sub) => sub.unsubscribe());
    activeSubscriptions.current.clear();
    subscribedRooms.current.clear();
  };

  const resubscribeToRooms = useCallback(() => {
    if (!stompClientRef.current || !isConnected) return;
    console.log("Resubscribing to rooms...");
    subscribedRooms.current.forEach((subscriptionPath) => {
      subscribeToRoom(subscriptionPath);
    });
  }, [isConnected]);

  const handleConnectionChange = useCallback(() => {
    if (navigator.onLine) {
      console.log("Network back online. Reconnecting WebSocket...");
  
      // Ensure previous STOMP client is properly deactivated before reinitializing
      if (stompClientRef.current) {
        stompClientRef.current.deactivate().then(() => {
          stompClientRef.current = null;
          initializeStompClient(); // Reinitialize after proper cleanup
        });
      } else {
        initializeStompClient(); // If no client exists, just initialize
      }
    } else {
      console.log("Network offline. Fully disconnecting WebSocket...");
      if (stompClientRef.current) {
        stompClientRef.current.deactivate();
        stompClientRef.current = null;
      }
      setIsConnected(false);
    }
  }, [initializeStompClient]);
  

  useEffect(() => {
    window.addEventListener("offline", handleConnectionChange);
    window.addEventListener("online", handleConnectionChange);
    initializeStompClient();

    return () => {
      window.removeEventListener("offline", handleConnectionChange);
      window.removeEventListener("online", handleConnectionChange);
      stompClientRef.current?.deactivate();
      stompClientRef.current = null;
      clearAllSubscriptions();
    };
  }, [handleConnectionChange, initializeStompClient]);

  const subscribeToRoom = useCallback(
    (subscriptionPath: string): StompSubscriptionWithUnsubscribe | null => {
      if (!subscriptionPath || subscribedRooms.current.has(subscriptionPath)) return null;

      // Unsubscribe from all current subscriptions
      clearAllSubscriptions();

      if (stompClientRef.current && isConnected) {
        const subscription = stompClientRef.current.subscribe(subscriptionPath, (message) =>
          onMessage(JSON.parse(message.body))
        );

        subscribedRooms.current.add(subscriptionPath);
        console.log(`Subscribed to: ${subscriptionPath}`);

        const subscriptionWithUnsubscribe: StompSubscriptionWithUnsubscribe = {
          ...subscription,
          subscriptionPath,
          unsubscribe: () => {
            subscription.unsubscribe();
            subscribedRooms.current.delete(subscriptionPath);
            activeSubscriptions.current.delete(subscriptionPath);
          },
        };

        activeSubscriptions.current.set(subscriptionPath, subscriptionWithUnsubscribe);
        return subscriptionWithUnsubscribe;
      }

      console.warn("STOMP client not connected. Subscription deferred.");
      return null;
    },
    [onMessage, isConnected]
  );

  const unsubscribeFromRoom = useCallback((subscriptionPath: string) => {
    const subscription = activeSubscriptions.current.get(subscriptionPath);
    if (subscription) {
      subscription.unsubscribe();
      console.log(`Unsubscribed from: ${subscriptionPath}`);
    }
  }, []);

  const sendMessage = useCallback(
    (destination: string, message: any): Promise<void> =>
      new Promise((resolve, reject) => {
        if (!stompClientRef.current || !stompClientRef.current.connected) {
          console.warn("STOMP client not connected. Message will NOT be sent.");
          reject(new Error("STOMP client not connected. Message discarded."));
          return;
        }
  
        try {
          stompClientRef.current.publish({ destination, body: JSON.stringify(message) });
          resolve();
        } catch (error) {
          reject(new Error("Failed to send message"));
        }
      }),
    []
  );  

  return { subscribeToRoom, unsubscribeFromRoom, sendMessage, isConnected };
};

export default useStompClient;
