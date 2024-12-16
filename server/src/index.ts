import { WebSocket, WebSocketServer } from "ws";
import { MediasoupServer } from "./Mediasoup";

const wss = new WebSocketServer({ port: 3000 });

wss.on("connection", (ws) => {
  console.log("connected");
  startServer(ws);
});

const startServer = async (ws: WebSocket) => {
  const mediaSoup = new MediasoupServer();
  const isCreated = await mediaSoup.initializeMediaSoup();
  if (isCreated) {
    mediaSoup.SocketServer(ws);
  }
};
