import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import "./index.css";
import App from "./App.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);

// Register the service worker
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/service-worker.js")
      .then((registration) => {
        console.log("Service Worker registered:", registration);
      })
      .catch((error) => {
        console.log("Service Worker registration failed:", error);
      });
  });
}

// Request notification permission
const requestNotificationPermission = async () => {
  try {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      console.log("Notification permission granted");
    } else {
      console.log("Notification permission denied");
    }
  } catch (err) {
    console.error("Error requesting notification permission:", err);
  }
};

// You can call this function on initialization or when the user logs in
requestNotificationPermission();
