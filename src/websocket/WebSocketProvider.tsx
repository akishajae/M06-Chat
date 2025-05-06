// src/contexts/WebSocketContext.tsx
import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

type WebSocketContextType = {
  socket: WebSocket | null;
  sendJson: (data: JSON) => void;
  connected: boolean;
};

const WebSocketContext = createContext<WebSocketContextType>({
  socket: null,
  sendJson: () => {},
  connected: false,
});

export const useWebSocket = () => useContext(WebSocketContext);

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const socketRef = useRef<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:3000"); // Tu URL real
    socketRef.current = ws;

    ws.onopen = () => {
      console.log("✅ WebSocket conectado");
      setConnected(true);
    };

    ws.onclose = () => {
      console.log("🔌 WebSocket desconectado");
      setConnected(false);
    };

    ws.onerror = (err) => {
      console.error("⚠️ Error en WebSocket", err);
    };

    return () => {
      ws.close();
    };
  }, []);

  const sendJson = (data: JSON ) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(data));
    } else {
      console.warn("❌ WebSocket no está conectado");
    }
  };

  return (
    <WebSocketContext.Provider
      value={{ socket: socketRef.current, sendJson, connected }}
    >
      {children}
    </WebSocketContext.Provider>
  );
};
