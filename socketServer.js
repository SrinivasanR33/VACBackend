const authSocket = require("./middleware/authSoket");
const newConnectionHandler = require("./soketHandlers/newConnectionHandler");
const disconnectHandler = require("./soketHandlers/disconnectHandler");
const directMessageHandler = require("./soketHandlers/directMessageHandler");
const directChatHistoryHandler = require("./soketHandlers/directChatHistoryHandler");
const roomCreateHandler = require("./soketHandlers/roomCreateHandler");
const roomJoinHandler = require("./soketHandlers/roomJoinHandler");
const roomLeaveHandler = require("./soketHandlers/roomLeaveHandler");
const roomInitializeConnectionHandler = require("./soketHandlers/roomInitializeConnectionHandler");
const roomSignalingDataHandler = require("./soketHandlers/roomSignalingDataHandler");

const serverStore = require("./serverStore");

const registerSocketServer = (server) => {
  const io = require("socket.io")(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  serverStore.setSocketServerInstance(io);

  io.use((socket, next) => {
    authSocket(socket, next);
  });

  const emitOnlineUsers = () => {
    const onlineUsers = serverStore.getOnlineUsers();
    io.emit("online-users", { onlineUsers });
  };

  io.on("connection", (socket) => {
    console.log("user connected");
    console.log(socket.id);

    newConnectionHandler(socket, io);
    emitOnlineUsers();

    socket.on("direct-message", (data) => {
      directMessageHandler(socket, data);
    });

    socket.on("direct-chat-history", (data) => {
      directChatHistoryHandler(socket, data);
    });

    socket.on("room-create", () => {
      roomCreateHandler(socket);
    });

    socket.on("room-join", (data) => {
      roomJoinHandler(socket, data);
    });

    socket.on("room-leave", (data) => {
      roomLeaveHandler(socket, data);
    });

    socket.on("conn-init", (data) => {
      roomInitializeConnectionHandler(socket, data);
    });

    socket.on("conn-signal", (data) => {
      roomSignalingDataHandler(socket, data);
    });

    socket.on("disconnect", () => {
      disconnectHandler(socket);
    });
  });

  setInterval(() => {
    emitOnlineUsers();
  }, [1000 * 8]);
};

module.exports = {
  registerSocketServer,
};
