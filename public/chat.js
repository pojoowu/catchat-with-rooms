let canvas, socket, button, input;
let messages = [];
let w = 40;
let memberNb = 0,
    allMessageNb = 0;

function setup() {
  canvas = createCanvas(windowWidth, 600);
  input = select('#sendText');
  button = select('#sendButton');
  socket = io.connect("http://localhost:3000");
  canvas.parent("#canvasP");
  socket.on("welcome", addWelcome);
  socket.on("receiveMsg", showComingMsg);
  socket.on("someoneEnter", changeMemberNb);
  socket.on("allMsgNb", changeMessageNb);
}

function changeMemberNb(data) {
  memberNb = data;
}

function changeMessageNb(data) {
  allMessageNb = data;
}

function addWelcome(data) {
  addMsg(data);
}

function addMsg(msg) {
  messages.push(msg);
  if (messages.length > height / w) {
    messages.shift();
  }
}

function sendMsg() {
  if (input.value()) {
    socket.emit("sendingMsg", input.value());
    addMsg(input.value());
    input.value('');
  }
}

function showComingMsg(data) {
  addMsg(data);
}

function keyPressed() {
  if (keyCode === ENTER) {
    sendMsg();
  }
}

function draw() {
  background(150);
  button.mousePressed(sendMsg);
  fill(0);
  rectMode(CORNER);
  textSize(16);
  text(`There are currently ${memberNb} people in the chat`, windowWidth - 290, 25);
  text(`There are ${allMessageNb} messages in the chat`, windowWidth - 250, 25+w);
  for (let i = 0; i < messages.length; i++) {
    noFill();
    stroke(0);
    rect(0, i * w, width, w);
    fill(0);
    rectMode(CORNER);
    textSize(w / 2);
    text(messages[i], 10, i * w + w * 2 / 3);
  }
}
