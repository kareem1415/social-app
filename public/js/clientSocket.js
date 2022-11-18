let connected = false

let HOST = "ws://khamsa-bako.herokuapp.com:3000";
let ws = new WebSocket(HOST);
let el = document.getElementById('server-time');
ws.onmessage = function (event) {
  el.innerHTML = 'Server time: ' + event.data;
};

// let socket = io("https://khamsa-bako.herokuapp.com/")

socket.emit("setup", userLoggedIn)

socket.on("connected", () => connected = true)
socket.on("message received", (newMessage) => messageReceived(newMessage))

