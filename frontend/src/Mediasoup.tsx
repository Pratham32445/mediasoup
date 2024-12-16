import React, { createContext, useEffect, useRef, useState } from "react";
import { Device, types } from "mediasoup-client";

export const mediaSoupContext = createContext(null);

const MediasoupProvider = ({ children }: { children: React.ReactNode }) => {
  const [ws, setWs] = useState<WebSocket | null>(null);
  const deviceRef = useRef<Device | null>(null);
  const transportRef = useRef<types.Transport | null>(null);

  useEffect(() => {
    const socket = new WebSocket("ws://localhost:3000");
    socket.onopen = () => {
      setWs(socket);
    };

    return () => {
      socket.close();
    };
  }, []);

  useEffect(() => {
    if (ws) {
      ws.onmessage = async (event: any) => {
        const parsedMessage = JSON.parse(event.data);
        console.log(parsedMessage);
        await handleWebSocketMessage(parsedMessage);
      };
    }
  }, [ws]);

  async function handleWebSocketMessage(parsedMessage: any) {
    switch (parsedMessage.type) {
      case "get-router-capabilities": {
        const device = new Device();
        await device.load({ routerRtpCapabilities: parsedMessage.data });
        deviceRef.current = device;
        sendMessage(ws!, { type: "create-transport" });
        break;
      }
      case "get-transport": {
        const data = parsedMessage.data;
        const transport = deviceRef.current!.createSendTransport({
          id: data.id,
          iceParameters: data.iceParameters,
          iceCandidates: data.iceCandidates,
          dtlsParameters: data.dtlsParameters,
        });

        transportRef.current = transport;

        break;
      }
      default:
        break;
    }
  }

  const sendMessage = (ws: WebSocket, message: any) => {
    if (!ws) return;
    ws.send(JSON.stringify(message));
  };

  const contextValue = {
    ws,
    initializeDevice: async () => {
      return true;
    },
  };

  return (
    <mediaSoupContext.Provider value={contextValue}>
      {children}
    </mediaSoupContext.Provider>
  );
};

export default MediasoupProvider;
