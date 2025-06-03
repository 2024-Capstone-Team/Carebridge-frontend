import debounce from "lodash/debounce";
import { useEffect, useRef, useCallback, useState } from "react";
import { Client, StompSubscription } from "@stomp/stompjs";

interface StompSubscriptionWithUnsubscribe extends StompSubscription {
  subscriptionPath: string;
  unsubscribe: () => void;
}

const useStompClient = (
  onMessage: (message: any) => void,
  onReconnect?: () => void
) => {
  const stompClientRef = useRef<Client | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const subscribedRooms = useRef<Set<string>>(new Set());
  const activeSubscriptions = useRef<Map<string, StompSubscriptionWithUnsubscribe>>(new Map());

  // const BASE_URL = "52.79.234.250/"
  const BASE_URL = import.meta.env.VITE_BACKEND_URL.replace(/^https?:\/\//, "").replace(/\/$/, "") + "/";// const BASE_URL = import.meta.env.VITE_API_HOST + "/";

  const initializeStompClient = useCallback(
    debounce(() => {
      if (stompClientRef.current) return; // Avoid multiple instances

      console.log("Initializing STOMP client...");
      const client = new Client({
        brokerURL: `wss://${BASE_URL}ws-stomp`,
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
        debug: (str) => console.log(`[WS DEBUG] ${str}`),
        onConnect: () => {
          console.log("[WS] Connected to WebSocket");
          setIsConnected(true);
          resubscribeToRooms();
          if (onReconnect) onReconnect();
        },
        onDisconnect: () => {
          console.warn("[WS] Disconnected from WebSocket");
          setIsConnected(false);
          clearAllSubscriptions();
        },
        onWebSocketError: (error) => console.error("[WS] WebSocket error:", error),
        onStompError: (frame) => {
          console.error("[WS] STOMP error:", frame);
          if (frame.headers["message"] === "Session closed.") {
            console.warn("[WS] STOMP session closed. Reconnecting...");
            clearAllSubscriptions(); // ✅ Clear subscriptions before reconnecting
            stompClientRef.current?.deactivate().then(() => {
              stompClientRef.current = null;
              initializeStompClient(); // Reconnect
            });
          }
        },
      });

      stompClientRef.current = client;
      client.activate();
    }, 500),
    []
  );

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
      if (!subscriptionPath || activeSubscriptions.current.has(subscriptionPath)) return null;

      if (!stompClientRef.current || !isConnected) {
        console.warn("STOMP client not connected. Subscription deferred.");
        return null;
      }

      const subscription = stompClientRef.current.subscribe(subscriptionPath, (message) => {
        console.log("📩 Received STOMP message:", message);
        try {
          const parsed = JSON.parse(message.body);
          console.log("📩 Parsed message body:", parsed);
          onMessage(parsed);
        } catch (err) {
          console.error("❌ Failed to parse message body:", message.body, err);
        }
      });

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
    },
    [onMessage, isConnected]
  );

  const unsubscribeFromRoom = useCallback((subscriptionPath: string) => {
    const subscription = activeSubscriptions.current.get(subscriptionPath);
    if (subscription) {
      subscription.unsubscribe();
      subscribedRooms.current.delete(subscriptionPath);
      activeSubscriptions.current.delete(subscriptionPath);
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
