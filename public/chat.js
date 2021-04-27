//handling dom elements
let canvas, socket, buttonSend, buttonCreateRoom, buttonLeaveRoom, inputMsg, inputRoomName,
  divHome, divRoom;
let w = 40;
let memberNb = 0,
  allMessageNb = 0;
let rooms = [],
  currentRoom, roomsName = [];


function setup() {
  canvas = createCanvas(windowWidth, w);
  divHome = select('.homepage');
  divRoom = select('.chatting');
  divRoom.hide();
  inputRoomName = select('#roomName');
  inputMsg = select('#sendText');
  buttonSend = select('#sendButton');
  buttonCreateRoom = select('#createRoom');
  buttonLeaveRoom = select('#leaveRoom');
  socket = io.connect("http://localhost:3000");
  canvas.parent("#canvasP");
  socket.on("welcome", addWelcome);
  socket.on("receiveMsg", showComingMsg);
  socket.on("someoneEnter", changeMemberNb);
  socket.on("allMsgNb", changeMessageNb);
  socket.on("createRoom", addRoomList);
  socket.on("roomNameUsed", errorNameUsed);
  socket.on("roomCreated", createUserRoom);
  socket.on("deleteRoom", deleteRoomList);
}
//show an error msg when the name of the room has already been used
function errorNameUsed(data) {
  let p = createP(data);
  p.parent(".homepage");
}
//delete a room when there are no one in it
function deleteRoomList(data) {
  let n = roomsName.indexOf(data);
  roomsName.splice(n, 1);
  rooms.splice(n, 1);
  console.log(rooms);
  let room = select(`#${data}`);
  room.remove();
}
//add a room when someone creates a new one
function addRoomList(data) {
  let room = createElement('li', data);
  room.class('rooms');
  room.id(data);
  rooms.push(room);
  roomsName.push(data);
  room.parent("#activeRooms");
}
//show the number of user currently online
function changeMemberNb(data) {
  memberNb = data;
}
//show the number of messages sent altogether
function changeMessageNb(data) {
  //allMessageNb = data;
}
//show the welcome msg of the room
function addWelcome(data) {
  addMsg(data);
}
//add the message to the chatLog
function addMsg(msg) {
  let d = new Date();
  let p = createP(`${msg} <span class = "message-time">
    ${d.getHours()}:${d.getMinutes()}:${d.getSeconds()} </span>`);
  p.class('chat-content');
  p.parent('#chatLog');
  allMessageNb++;
}
//send a msg to the server
function sendMsg() {
  if (inputMsg.value()) {
    let data = {
      room: currentRoom,
      msg: inputMsg.value()
    };
    socket.emit("sendingMsg", data);
    addMsg(inputMsg.value());
    inputMsg.value('');
  }
}
//receive the msg from the server sent by other users
function showComingMsg(data) {
  addMsg(data);
}
//allow pressing enter to send a msg
function keyPressed() {
  if (keyCode === ENTER) {
    sendMsg();
  }
}
//send a request to server to create a room
function requestcreateRoom() {
  if (inputRoomName.value()) {
    socket.emit("createRoomRequest", inputRoomName.value());
    currentRoom = inputRoomName.value();
  }
}
//create a room when receive a confirm of the server
function createUserRoom(data) {
  inputRoomName.value('');
  divHome.hide();
  divRoom.show();
  currentRoom = data;
}
//send a msg to server to quit a room
function leaveUserRoom() {
  divHome.show();
  divRoom.hide();
  allMessageNb = 0;
  socket.emit("leaveRoom", currentRoom);
}
//send a msg to server to join a room
function joinUserRoom(name) {
  divHome.hide();
  divRoom.show();
  socket.emit("joinRoom", name);
  currentRoom = name;
}

function draw() {
  background(150);
  for (let i = 0; i < rooms.length; i++) {
    rooms[i].mousePressed(function() {
      joinUserRoom(roomsName[i]);
    });
  };
  buttonSend.mousePressed(sendMsg);
  buttonCreateRoom.mousePressed(requestcreateRoom);
  buttonLeaveRoom.mousePressed(leaveUserRoom);
  fill(0);
  rectMode(CORNER);
  textSize(16);
  text(`There are currently ${memberNb} people in the chat`, 10, 25);
  text(`There are ${allMessageNb} messages in the chat`, windowWidth - 250, 25);
}
