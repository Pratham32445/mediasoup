import * as mediasoup from "mediasoup";
import { WebSocket } from "ws";

export class MediasoupServer {
  private workers: mediasoup.types.Worker[] = [];
  private routers: mediasoup.types.Router[] = [];
  private transports: Map<any, any> = new Map();
  private producers: Map<any, any> = new Map();
  private consumers: Map<any, any> = new Map();

  async initializeMediaSoup() {
    return new Promise(async (resolve, reject) => {
      try {
        const worker = await mediasoup.createWorker({
          rtcMinPort: 10000,
          rtcMaxPort: 20000,
        });
        worker.on("died", () => {
          console.error("MediaSoup worker died");
        });

        const router = await worker.createRouter({
          mediaCodecs: [
            {
              kind: "audio",
              mimeType: "audio/opus",
              clockRate: 48000,
              channels: 2,
            },
            {
              kind: "video",
              mimeType: "video/VP8",
              clockRate: 90000,
              parameters: {
                "x-google-start-bitrate": 1000,
              },
            },
          ],
        });

        this.workers.push(worker);
        this.routers.push(router);
        resolve(true);
      } catch (error) {
        reject(false);
        console.error("Error in initializeMediaSoup:", error);
        throw error;
      }
    });
  }

  SocketServer(socket: WebSocket) {
    socket.send(
      JSON.stringify({
        type: "get-router-capabilities",
        data: this.routers[0].rtpCapabilities,
      })
    );
    socket.on("message", async (event) => {
      const parsedData = JSON.parse(event.toString());
      console.log(parsedData);
      switch (parsedData.type) {
        case "create-transport":
          const router = this.routers[0];
          const transport = await router.createWebRtcTransport({
            listenIps: [{ ip: "0.0.0.0",announcedIp: "127.0.0.1"}],
            enableUdp: true,
            enableTcp: true,
            preferUdp: true,
          });
          this.transports.set(transport.id, transport);
          const data = {
            id: transport.id,
            iceParameters: transport.iceParameters,
            iceCandidates: transport.iceCandidates,
            dtlsParameters: transport.dtlsParameters,
          };
          this.sendMessage(socket, { type: "get-transport", data });
          break;
        case "transport-connect":
          console.log(parsedData);
          break;
        default:
          break;
      }
    });
  }

  private sendMessage(ws: WebSocket, message: any) {
    ws.send(JSON.stringify(message));
  }
}
