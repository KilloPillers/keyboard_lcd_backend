require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const { crc32 } = require("zlib");

const app = express();
app.use(cors());

const server = http.createServer(app);

const LCD_HEIGHT = 32;
const LCD_WIDTH = 128;

var serverByteArray = new Uint8Array((LCD_HEIGHT * LCD_WIDTH) / 8);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("User Connected: ", socket.id);

  if (serverByteArray) {
    socket.emit("DrawEvent", serverByteArray);
  }

  socket.on("DrawEvent", (clientByteArray) => {
    for (let i = 0; i < serverByteArray.length; i++) {
      serverByteArray[i] = clientByteArray[i];
      // serverByteArray[i] |= clientByteArray[i];
    }
    socket.broadcast.emit("DrawEvent", serverByteArray);
    console.log("Sending DrawEvent:", serverByteArray.length, serverByteArray);
  });

  socket.on("disconnect", () => {
    console.log("User Disconnected: ", socket.id);
  });
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
