import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import { env } from "./env.js";
import { Conversation } from "./models.js";

let io;

export const initSocket = (server) => {
  io = new Server(server, {
    cors: { origin: env.clientUrl, credentials: true },
  });

  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error("Token manquant"));
      const payload = jwt.verify(token, env.jwtSecret);
      socket.userId = payload.id;
      socket.userRole = payload.role;
      next();
    } catch {
      next(new Error("Token invalide"));
    }
  });

  io.on("connection", (socket) => {
    console.log(`🔌 Connecté : ${socket.userRole} ${socket.userId}`);
    socket.join(`user:${socket.userId}`);

    socket.on("chat:join", (conversationId) => {
      socket.join(`conv:${conversationId}`);
    });

    socket.on("chat:leave", (conversationId) => {
      socket.leave(`conv:${conversationId}`);
    });

    socket.on("chat:send", async ({ conversationId, content }) => {
      try {
        const conv = await Conversation.findById(conversationId);
        if (!conv) return;

        conv.messages.push({
          sender: socket.userId,
          senderRole: socket.userRole,
          content,
        });
        conv.lastMessage = content;
        conv.lastMessageAt = new Date();

        if (socket.userRole === "user") conv.unreadProvider += 1;
        else if (socket.userRole === "provider") conv.unreadClient += 1;

        await conv.save();

        const saved = conv.messages[conv.messages.length - 1];
        io.to(`conv:${conversationId}`).emit("chat:message", saved);

        const targetId = socket.userRole === "user" ? conv.provider : conv.client;
        io.to(`user:${targetId}`).emit("notification", {
          type: "message",
          title: "Nouveau message",
          message: content.slice(0, 60),
          conversationId,
        });
      } catch (err) {
        console.error("chat:send error", err);
      }
    });

    socket.on("chat:read", async (conversationId) => {
      try {
        const conv = await Conversation.findById(conversationId);
        if (!conv) return;
        if (socket.userRole === "user") conv.unreadClient = 0;
        else conv.unreadProvider = 0;
        await conv.save();
      } catch {}
    });

    socket.on("disconnect", () => {
      console.log(`🔌 Déconnecté : ${socket.userId}`);
    });
  });

  return io;
};

export const getIO = () => io;