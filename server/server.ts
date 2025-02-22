import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import db from "./config/db";
import authRouter from "./routes/authRoutes";
import chatRouter from "./routes/chatRoutes";
import messageRouter from "./routes/messageRoutes";
import http from "http";
import { Server } from "socket.io";
import userRouter from "./routes/userRoutes";
import cors from "cors";
import errorMiddleware from "./middlewares/errorMiddleware";
import socketHandler from "./socket/socketHandler";
dotenv.config();

const app: Express = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true,
  },
});
db();

app.use(cors());
app.use(express.json());

// ROUTES
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/chat", chatRouter);
app.use("/api/v1/message", messageRouter);
app.use("/api/v1/user", userRouter);
// DEFAULT ROUTE
app.get("/", (req: Request, res: Response) => {
  res.send("Server is working");
});

socketHandler(io);

// NOT FOUND ROUTE
app.use("*", (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: `${req.originalUrl} is not defined`,
  });
});

// ERROR MIDDLEWARE
app.use(errorMiddleware);

server.listen(8000, () => console.log(`Listening on port 8000`));
