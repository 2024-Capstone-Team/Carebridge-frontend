import { useEffect, useRef, useCallback, useState } from "react";
import { Client, StompSubscription } from "@stomp/stompjs";

interface StompSubscriptionWithUnsubscribe extends StompSubscription {
  subscriptionPath: string;
  unsubscribe: () => void;
}

const useStompClient = (onMessage: (message: any) => void) => {
  const stompClientRef = useRef<Client | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [pendingSubscriptions, setPendingSubscriptions] = useState<StompSubscriptionWithUnsubscribe[]>([]);
  const subscribedRooms = useRef<Set<string>>(new Set()); // Track currently subscribed rooms

  // Monitor internet connectivity
  const handleConnectionChange = useCallback(() => {
    if (!navigator.onLine) {
      // If offline, deactivate the WebSocket connection
      if (stompClientRef.current) {
        stompClientRef.current.deactivate();
        setIsConnected(false);
        console.log("Disconnected WebSocket due to no internet");
      }
    }
  }, []);

  useEffect(() => {
    // Listen for online/offline changes
    window.addEventListener("offline", handleConnectionChange);
    window.addEventListener("online", handleConnectionChange);

    // Cleanup event listeners
    return () => {
      window.removeEventListener("offline", handleConnectionChange);
      window.removeEventListener("online", handleConnectionChange);
    };
  }, [handleConnectionChange]);

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
          const isSubscribed = subscribedRooms.current.has(subscription.subscriptionPath);
          if (!isSubscribed) {
            const newSubscription = stompClientRef.current?.subscribe(
              subscription.subscriptionPath,
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
              subscribedRooms.current.add(subscription.subscriptionPath); // Mark as subscribed
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
    const subscription = pendingSubscriptions.find((sub) => sub.subscriptionPath === roomId);

    if (subscription && subscribedRooms.current.has(roomId)) {
      console.log(`Unsubscribing from room: ${roomId}`);
      subscription.unsubscribe();
      subscribedRooms.current.delete(roomId);
    } else {
      console.warn(`Cannot unsubscribe from room: ${roomId}. Not found.`);
    }
  }, [pendingSubscriptions]);

  const subscribeToRoom = useCallback(
    (subscriptionPath: string): StompSubscriptionWithUnsubscribe | null => {
      if (!subscriptionPath) {
        console.warn("Subscription path is empty. Cannot subscribe.");
        return null;
      }
  
      // Check if already subscribed
      if (subscribedRooms.current.has(subscriptionPath)) {
        console.log(`Already subscribed to: ${subscriptionPath}`);
        return null;
      }
  
      // Unsubscribe to be connected to single channel
      const currentChannel = Array.from(subscribedRooms.current)[0]; 
      if (currentChannel && currentChannel !== subscriptionPath) {
        console.log(`Switching from: ${currentChannel} to: ${subscriptionPath}`);
        unsubscribeFromRoom(currentChannel);
      }
  
      // Check STOMP connection and subscribe
      if (stompClientRef.current && isConnected) {
        const subscription = stompClientRef.current.subscribe(
          subscriptionPath, 
          (message) => {
            console.log(`Received message from ${subscriptionPath}:`, message.body);
            onMessage(JSON.parse(message.body));
          }
        );
  
        subscribedRooms.current.add(subscriptionPath);
        console.log(`Subscribed to: ${subscriptionPath}`);
  
        const subscriptionWithUnsubscribe: StompSubscriptionWithUnsubscribe = {
          ...subscription,
          subscriptionPath, // roomId -> subscriptionPath 
          unsubscribe: () => {
            console.log(`Unsubscribing from: ${subscriptionPath}`);
            subscription.unsubscribe();
            subscribedRooms.current.delete(subscriptionPath);
          },
        };
  
        setPendingSubscriptions((prev) => [...prev, subscriptionWithUnsubscribe]);
  
        return subscriptionWithUnsubscribe;
      }
  
      console.warn("STOMP client not connected yet. Subscription deferred.");
      return null;
    },
    [onMessage, isConnected, unsubscribeFromRoom]
  );

  const sendMessage = useCallback((destination: string, message: any): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (!stompClientRef.current) {
        console.warn("STOMP client not initialized. Message not sent.");
        reject(new Error("STOMP client not initialized"));
        return;
      }

      // Then check if the WebSocket is connected and the device is online
      // if (!navigator.onLine) {
      //   console.warn("Device is offline. Message not sent.");
      //   reject(new Error("Device is offline"));
      //   return;
      // }
  
      if (!stompClientRef.current.connected) {
        console.warn("STOMP client not connected. Message not sent.");
        reject(new Error("STOMP client not connected"));
        return;
      }
  
      try {
        console.log(`Sending message to ${destination}:`, message);
        stompClientRef.current.publish({
          destination,
          body: JSON.stringify(message),
        });
        resolve(); // Immediately resolve since there's no feedback
      } catch (error) {
        console.error("Error sending message:", error);
        reject(new Error("Failed to send message"));
      }
    });
  }, []);
  

  return { subscribeToRoom, unsubscribeFromRoom, sendMessage, isConnected };
};

export default useStompClient;