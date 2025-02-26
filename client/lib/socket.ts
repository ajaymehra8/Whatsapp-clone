import io from "socket.io-client";
import { Socket } from "socket.io-client";

// Using singleton pattern to make sure only one connection is created
let socket: typeof Socket | null = null;

const getSocket = (): typeof Socket|null => {
  if (!socket ) {
    socket = io(process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000", {
      reconnection: true,
      transports: ["websocket"],
    });

    socket.on("connect", () => {
      console.log("Socket connected with ID:", socket?.id);
    });
  }

  return socket;
};

export default getSocket;
