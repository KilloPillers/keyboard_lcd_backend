require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const allowedOrigins =
  process.env.NODE_ENV === "production"
    ? ["https://keyboard.juan-alvarez.dev"]
    : ["http://localhost:5173"];

var corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("CORS not allowed for this origin: " + origin));
    }
  },
};

const app = express();
app.use(cors(corsOptions));

const server = http.createServer(app);

const LCD_HEIGHT = 32;
const LCD_WIDTH = 128;

var serverByteArray = new Uint8Array((LCD_HEIGHT * LCD_WIDTH) / 8);

const io = new Server(server, {
  cors: corsOptions,
});

io.on("connection", (socket) => {
  console.log("User Connected: ", socket.id);

  if (serverByteArray) {
    socket.emit("DrawEvent", serverByteArray);
  }

  socket.on("DrawEvent", (clientByteArray) => {
    for (let i = 0; i < serverByteArray.length; i++) {
      serverByteArray[i] = clientByteArray[i];
    }
    console.log(clientByteArray);
    socket.broadcast.emit("DrawEvent", serverByteArray);
    console.log("Sending DrawEvent:", serverByteArray.length, serverByteArray);
  });

  socket.on("disconnect", () => {
    console.log("User Disconnected: ", socket.id);
  });
});

const PORT = process.env.PORT;
server.listen(PORT, () => {
  console.log(`Server is running on port:${PORT}`);
});
