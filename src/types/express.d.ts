import { Server as SocketServer } from "socket.io";

declare global {
  namespace Express {
    interface Request {
      io?: SocketServer;
      user?: {
        id: string;
        [key: string]: any;
      };
    }
  }
}
