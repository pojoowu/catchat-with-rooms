let express = require('express'),
  app = express(),
  server = app.listen(3000);


app.use(express.static('public'));

let socket = require('socket.io'),
  io = socket(server);

let memberNb = 0;
let allMessages = [],
  messageNb = 0;
let rooms = new Set();
let sockets = new Set();
let d = new Date();

io.on('connection', newConnection);


function newConnection(socket) {
  sockets.add(socket);
  memberNb++;
  io.emit("someoneEnter", memberNb);
  for (room of rooms) {
    socket.emit("createRoom", room);
  }
  console.log("Welcome: " + socket.id);

  socket.on("createRoomRequest", createRoom);
  socket.on("joinRoom", joinRoom);
  socket.on("leaveRoom", leaveRoom);
  socket.on("sendingMsg", broadcastMsg);
  socket.on("disconnect", reduceMember);

  function leaveRoom(data) {
    socket.leave(data);
    let someStillInRoom = false;
    for (user of sockets) {
      if (user.rooms.has(data)) {
        someStillInRoom = true;
      }
    }
    if (!someStillInRoom) {
      rooms.delete(data);
      io.emit("deleteRoom", data);
    }
    console.log(rooms);
  }

  function joinRoom(data) {
    socket.join(data);
    socket.emit("welcome", `Welcome to the ${data} room! at ${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}`);
  }

  function createRoom(data) {
    if (!rooms.has(data)) {
      console.log(socket.id + ', ' + data);
      rooms.add(data);
      socket.join(data);
      io.emit("createRoom", data);
      socket.emit("roomCreated", data);
      socket.emit("welcome", `Welcome to the ${data} room! at ${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}`);
    } else {
      socket.emit("roomNameUsed", `${data} has already been used.`)
    }
  }

  function broadcastMsg(data) {
    socket.to(data.room).emit("receiveMsg", data.msg);
    messageNb++;
    io.emit("allMsgNb", messageNb);
    console.log(data);
  }

  function reduceMember() {
    memberNb--;
    console.log(socket.id + " is leaving");
    sockets.delete(socket);
  }
}



console.log("My socket server is running, press Ctrl-C to terminate...");
