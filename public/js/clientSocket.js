let connected = false

let socket = "ws://khamsa-bako.herokuapp.com:3000";
let ws = new WebSocket(socket);
let el = document.getElementById('server-time');
ws.onmessage = function (event) {
  el.innerHTML = 'Server time: ' + event.data;
};

socket.emit("setup", userLoggedIn)

socket.on("connected", () => connected = true)
socket.on("message received", (newMessage) => messageReceived(newMessage))

