let express = require('express'),
    app = express(),
    server = app.listen(3000);


app.use(express.static('public'));

let socket = require('socket.io'),
    io = socket(server);

let memberNb = 0;
let allMessages = [],
    messageNb = 0;
let rooms = [];

io.on('connection', newConnection);


function newConnection(socket){
  memberNb++;
  io.emit("someoneEnter", memberNb);
  console.log("Welcome: "+ socket.id);
  let welcomeMsg = {
    msg: "Welcome to the chat!"
  };
  io.to(socket.id).emit("welcome", "Welcome to the chat!");

  socket.on("sendingMsg", broadcastMsg);
  socket.on("disconnect", reduceMember);

  function broadcastMsg(data){
    allMessages.push(data);
    socket.broadcast.emit("receiveMsg", data);
    messageNb++;
    io.emit("allMsgNb", messageNb);
    console.log(data);
  }

  function reduceMember(){
    memberNb--;
    console.log(socket.id+" is leaving");
  }
}



console.log("My socket server is running, press Ctrl-C to terminate...");
