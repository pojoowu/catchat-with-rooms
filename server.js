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

io.on('connection', newConnection);


function newConnection(socket) {
  sockets.add(socket);
  memberNb++;
  io.emit("someoneEnter", memberNb);
  for (room of rooms) {
    socket.emit("createRoom", room);
  }
  console.log("Welcome: " + socket.id);

  socket.on("createRoom", createRoom);
  socket.on("joinRoom", joinRoom);
  socket.on("leaveRoom", leaveRoom);
  socket.on("sendingMsg", broadcastMsg);
  socket.on("disconnect", reduceMember);

  function leaveRoom(data) {
    socket.leave(data);
    let someStillInRoom = false;
    for(socket of sockets){
      if(socket.rooms.has(data)){
        someStillInRoom = true;
      }
    }
    if(!someStillInRoom){
      rooms.delete(data);
      io.emit("deleteRoom", data);
    }
    console.log(rooms);
  }

  function joinRoom(data) {
    console.log(data);
    socket.join(data);
    socket.emit("welcome", `Welcome to the ${data} room!`);
  }

  function createRoom(data) {
    if (!rooms.has(data)) {
      rooms.add(data);
      socket.join(data);
      io.emit("createRoom", data);
      socket.emit("roomCreated", data);
      socket.emit("welcome", `Welcome to the ${data} room!`);
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
