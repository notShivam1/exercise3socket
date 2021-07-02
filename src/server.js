const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const fetch = require("node-fetch");

const port = process.env.PORT || 4001;

const app = express();

const server = http.createServer(app);

const io = socketIo(server, {
  cors: {
    origin: "*",
  },
  reconnection: true,
  reconnectionDelay: 500,
  reconnectionAttempts: 10,
});

let interval;

io.on("connection", (socket) => {
  console.log("New client connected");
  if (interval) {
    clearInterval(interval);
  }
  interval = setInterval(() => getApiAndEmit(socket), 1000);
  socket.on("disconnect", () => {
    console.log("Client disconnected");
    clearInterval(interval);
  });
});

const getApiAndEmit = async (socket) => {
  var response = await fetch(`https://api.bitfinex.com/v1/pubticker/btcusd`)
    .then((res) => res.json())
    .then((body) => {
      if (body) {
        return body;
      } else {
        return "couldnt find the crypto ";
      }
    })
    .catch((e) => {
      return console.log(e);
    });
  socket.emit("FromAPI", response);
};

server.listen(port, () => console.log(`Listening on port ${port}`));
